import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from 'src/utils/log-utils';
import {
  AccountCreatedEvent,
  AccountCreation,
  GoogleLoginDto,
  HostAccountCreation,
  JWTUser,
  LoginDto,
  PasswordResetConfirmEvent,
  PasswordResetEvent,
} from './types';
import { Crypto } from 'src/crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/users.entity';
import { Request, Response } from 'express';
import {
  ACCESS_TOKEN,
  ADMIN_REFERESH_TOKEN,
  ADMIN_TOKEN,
  CURRENT_ROLE_KEY,
  HOST_ACCESS_TOKEN,
  HOST_REFRESH_TOKEN,
  REFRESH_TOKEN,
} from 'src/constants';
import { ConfigService } from '@nestjs/config';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateShortCode } from 'src/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TokenRepository } from 'src/repositories/token.repository';
import { AdminService } from 'src/admin/admin.service';
import { AdminLoginType } from 'src/admin/types';
import { UserActiveStatus } from 'src/users/guests/types';

@Injectable()
export class AuthService {
  private readonly VERIFICATION_CODE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private hostRepository: HostsRepository,
    private jwtService: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
    private tokenRepo: TokenRepository,
    private adminService: AdminService,
  ) {}

  async registerAccountVerificationCode(
    accountId: string,
    code: string,
  ): Promise<void> {
    await this.cache.set(
      `/users/${accountId.toString()}/code/account-verification`,
      code,
      this.VERIFICATION_CODE_TTL,
    );
  }

  async validateAccountVerificationCode(
    accountId: string,
    code: string,
  ): Promise<boolean> {
    const storedCode = await this.cache.get(
      `/users/${accountId.toString()}/code/account-verification`,
    );
    console.log(`From storedcode: ${storedCode}`);
    return code === storedCode;
  }

  async removeAccountVerificationCode(accountId: string) {
    this.cache.del(`/users/${accountId.toString()}/code/account-verification`);
  }

  async verifyAccount(accountId: string, code: string) {
    const isCodeValid = await this.validateAccountVerificationCode(
      accountId,
      code,
    );
    if (!isCodeValid) {
      throw new BadRequestException(
        "Error! Provided security code isn't valid.",
      );
    }
    await this.removeAccountVerificationCode(accountId);

    const user = await this.userRepository.findOne({
      where: { id: accountId },
    });

    user.isEmailVerified = true;

    return await this.userRepository.save(user);
  }

  async resendConfirmationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      Logger.log('User does not exist');
      throw new BadRequestException('user does not exist');
    }
    const code = generateShortCode();
    await this.registerAccountVerificationCode(user.id, code);

    const accountCreatedAventPayload: AccountCreatedEvent = {
      email: user.email,
      code: code,
      id: user.id,
    };

    this.eventEmitter.emit('account.created', accountCreatedAventPayload);
    return user;
  }

  async registerPasswordResetCode(accountId: string, code: string) {
    await this.cache.set(
      `/users/${accountId.toString()}/code/reset-password`,
      code,
      this.VERIFICATION_CODE_TTL,
    );
  }

  async validateResetPasswordCode(accountId: string, code: string) {
    const storedCode = await this.cache.get(
      `/users/${accountId.toString()}/code/reset-password`,
    );
    return code === storedCode;
  }

  async removeResetPasswordCode(accountId: string) {
    this.cache.del(`/users/${accountId.toString()}/code/reset-password`);
  }

  async resetPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      Logger.log(`password reset for ${email} triggered. `);
      throw new BadRequestException('No user with this email');
    }

    const code = generateShortCode();

    await this.registerPasswordResetCode(user.id, code);

    const passwordResetPayload: PasswordResetEvent = {
      id: user.id,
      email: user.email,
      otpCode: code,
      userFirstName: user.firstName,
    };

    this.eventEmitter.emit('password.reset', passwordResetPayload);
    return user;
  }

  async resetPasswordConfirmation(
    accountId: string,
    code: string,
    password: string,
  ) {
    const isCodeValid = await this.validateResetPasswordCode(accountId, code);
    if (!isCodeValid) {
      throw new BadRequestException(
        "Error! Provided security code isn't valid.",
      );
    }
    await this.removeResetPasswordCode(accountId);

    const user = await this.userRepository.findOne({
      where: { id: accountId, isCreatedWithGoogle: false },
    });

    if (!user) {
      throw new BadRequestException('user cannot be found.');
    }

    user.password = await Crypto.hashify('sha256', password);

    const host = await this.hostRepository.getHostAllFieldsById(accountId);
    if (host) {
      host.password = await Crypto.hashify('sha256', password);
      await this.hostRepository.save(host);
    }

    //invalidate all logged in users
    await this.tokenRepo.invalidateAllTokensById(user.id);

    const updatedUser = this.userRepository.save(user);

    const resetConfirmedPayload: PasswordResetConfirmEvent = {
      email: user.email,
      eventDate: new Date((await updatedUser).updatedAt).toDateString(),
    };

    this.eventEmitter.emit('password.confirm', resetConfirmedPayload);
    return user;
  }

  async createAccount(payload: AccountCreation) {
    Logger.log(
      new Log('createAccount triggered for:', {
        email: Log.escapeEmail(payload.email),
      }),
    );

    const userAlreadyExists = await this.userRepository.findOne({
      where: {
        email: payload.email,
      },
    });

    if (userAlreadyExists) {
      throw new BadRequestException(
        `A user with ${payload.email} already exists`,
      );
    }

    Logger.log(
      new Log('created  profile for:', {
        email: Log.escapeEmail(payload.email),
      }),
    );

    const newUser = this.userRepository.create({
      ...payload,
      password: await Crypto.hashify('sha256', payload.password),
    });

    const createdUser = await this.userRepository.save(newUser);

    const code = generateShortCode();
    await this.registerAccountVerificationCode(createdUser.id, code);

    const accountCreatedAventPayload: AccountCreatedEvent = {
      email: createdUser.email,
      code: code,
      id: createdUser.id,
    };

    this.eventEmitter.emit('account.created', accountCreatedAventPayload),
      Logger.log(
        new Log('created a user for:', {
          email: Log.escapeEmail(payload.email),
        }),
      );

    return createdUser;
  }

  async createAccountWithGoogle(payload: AccountCreation) {
    Logger.log(
      new Log('createAccount triggered for:', {
        email: Log.escapeEmail(payload.email),
      }),
    );

    const userAlreadyExists = await this.userRepository.findOne({
      where: {
        email: payload.email,
      },
    });

    if (userAlreadyExists) {
      throw new BadRequestException(
        `A user with ${payload.email} already exists`,
      );
    }

    Logger.log(
      new Log('created  profile for:', {
        email: Log.escapeEmail(payload.email),
      }),
    );

    const newUser = this.userRepository.create({
      ...payload,
      isCreatedWithGoogle: payload.isGoogle,
      isEmailVerified: payload.isEmailVerified,
    });

    const createdUser = await this.userRepository.save(newUser);

    const code = generateShortCode();
    await this.registerAccountVerificationCode(createdUser.id, code);

    const accountCreatedAventPayload: AccountCreatedEvent = {
      email: createdUser.email,
      code: code,
      id: createdUser.id,
    };

    this.eventEmitter.emit('account.created', accountCreatedAventPayload),
      Logger.log(
        new Log('created a user for:', {
          email: Log.escapeEmail(payload.email),
        }),
      );

    return createdUser;
  }

  async createHostAccount(payload: HostAccountCreation) {
    Logger.log(
      new Log('createAccount triggered for:', {
        email: Log.escapeEmail(payload.email),
      }),
    );

    const userAlreadyExists = await this.userRepository.findOne({
      where: {
        email: payload.email,
      },
    });

    const hostAlreadyExists = await this.hostRepository.findByEmail(
      payload.email,
    );

    if (hostAlreadyExists) {
      throw new BadRequestException(
        `A host with ${payload.email} already exists`,
      );
    }

    let createdGuest = userAlreadyExists;
    if (!userAlreadyExists) {
      createdGuest = await this.createAccount(payload);
    }

    const modifiedPayload = {
      ...payload,
      password: userAlreadyExists
        ? userAlreadyExists.password
        : await Crypto.hashify('sha256', payload.password),
      ...(createdGuest && { user: createdGuest, userId: createdGuest.id }),
    };

    const hostCreated = await this.hostRepository.save(modifiedPayload);
    return hostCreated;
  }

  async login({ email, password }: LoginDto) {
    Logger.log(
      new Log('Login triggered', {
        email: Log.escapeEmail(email),
      }),
    );

    const user = await this.userRepository.findOne({
      where: {
        email,
        password: await Crypto.hashify('sha256', password),
      },
    });

    let jwtUser: JWTUser = null;

    if (!user) throw new BadRequestException(`Incorrect email or password`);

    if (user.active === UserActiveStatus.RESTRICTED) {
      throw new BadRequestException(`account is restricted`);
    }

    if (user) {
      jwtUser = {
        id: user.id,
        email: user.email,
      };
    }

    console.log(`From auth service: ${JSON.stringify(user)}`);
    return {
      path: user ? 'user' : 'host',
      accessToken: await this.generateAccessToken(jwtUser),
      refreshToken: await this.generateRefreshToken(jwtUser),
    };
  }

  async loginWithGoogle({ email }: GoogleLoginDto) {
    Logger.log(
      new Log('Login triggered', {
        email: Log.escapeEmail(email),
      }),
    );
    console.log('FROM LOGIN WITH GOOGLE');

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    let jwtUser: JWTUser = null;

    if (!user) throw new BadRequestException(`No user found`);

    if (!user.isCreatedWithGoogle) {
      if (!user) throw new BadRequestException(`Incorrect Login method`);
    }

    if (user.active === UserActiveStatus.RESTRICTED) {
      throw new BadRequestException(`account is restricted`);
    }

    if (user) {
      jwtUser = {
        id: user.id,
        email: user.email,
      };
    }

    return {
      path: user ? 'user' : 'host',
      accessToken: await this.generateAccessToken(jwtUser),
      refreshToken: await this.generateRefreshToken(jwtUser),
    };
  }

  async hostLogin({ email, password }: LoginDto) {
    Logger.log(
      new Log('Login triggered for:', {
        email: Log.escapeEmail(email),
      }),
    );

    const host = await this.hostRepository.findByEmail(email);

    if (!host) throw new BadRequestException(`Incorrect email or password`);

    const jwtUser: JWTUser = {
      id: host.id,
      email: host.email,
    };

    return {
      accessToken: await this.generateAccessToken(jwtUser),
      refreshToken: await this.generateRefreshToken(jwtUser),
    };
  }

  async googleLogin(req: { user: any }) {
    if (!req.user) {
      throw new InternalServerErrorException(
        'Something went wrong.Please try again.',
      );
    }

    const googleUser = await this.userRepository.findOne({
      where: {
        email: req.user.email,
      },
    });

    if (!googleUser) {
      throw new NotFoundException(
        `No user account with this email ${req.user.email} `,
      );
    }

    if (googleUser.active === UserActiveStatus.RESTRICTED) {
      throw new BadRequestException(`account is restricted`);
    }

    const jwtUser: JWTUser = {
      email: req.user.email,
      id: googleUser.id,
    };

    return {
      accessToken: await this.generateAccessToken(jwtUser),
      refreshToken: await this.generateRefreshToken(jwtUser),
    };
  }

  async adminLogin(adminDto: AdminLoginType) {
    const admin = await this.adminService.getAdmin(adminDto);
    if (!admin) {
      throw new NotFoundException('invalid email or password');
    }
    const jwtUser: JWTUser = {
      id: admin.id,
      role: admin.role,
      email: admin.email,
    };
    return {
      accessToken: await this.generateAccessToken(jwtUser),
      refreshToken: await this.generateRefreshToken(jwtUser),
    };
  }

  async copyUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const userFromHostId = await this.userRepository.findOne({
      where: { hostId: userId },
    });

    if (!user && !userFromHostId) {
      throw new BadRequestException('user does not exist');
    }

    const jwtUser: JWTUser = {
      ...(user && { id: user.id }),
      ...(user && { email: user.email }),
      ...(userFromHostId && { id: userFromHostId.id }),
      ...(userFromHostId && { email: userFromHostId.email }),
    };
    return {
      accessToken: await this.generateAccessToken(jwtUser),
      refreshToken: await this.generateRefreshToken(jwtUser),
    };
  }

  async refreshClientToken(@Req() req: Request, @Res() res: Response) {
    const role = req.cookies[CURRENT_ROLE_KEY];
    const refreshToken = req.cookies[REFRESH_TOKEN];
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      const token = await this.tokenRepo.getToken({
        userId: payload.id,
        token: refreshToken,
      });
      if (!token) {
        throw new Error('No token provided');
      }
      const accessToken = await this.generateAccessToken(payload);
      return accessToken;
    } catch (error) {
      const accessTokenKey = role === 'host' ? HOST_ACCESS_TOKEN : ACCESS_TOKEN;
      const refreshTokenKey =
        role === 'host' ? HOST_REFRESH_TOKEN : REFRESH_TOKEN;
      await this.tokenRepo.removeToken(refreshToken);
      res.clearCookie(REFRESH_TOKEN);
      res.clearCookie(ACCESS_TOKEN);
      throw new UnauthorizedException();
    }
  }

  async refreshAdminToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies[ADMIN_REFERESH_TOKEN];
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      const token = await this.tokenRepo.getToken({
        userId: payload.id,
        token: refreshToken,
      });
      if (!token) {
        throw new Error('No token provided');
      }
      const accessToken = await this.generateAccessToken(payload);
      return accessToken;
    } catch (error) {
      await this.tokenRepo.removeToken(refreshToken);
      res.clearCookie(ADMIN_TOKEN);
      res.clearCookie(ADMIN_REFERESH_TOKEN);
      throw new UnauthorizedException();
    }
  }

  async updatePassword(
    user: JWTUser,
    { password, oldPassword }: { password: string; oldPassword: string },
  ) {
    if (!password || !oldPassword) {
      throw new BadRequestException('invalid request, missing fields');
    }

    const userExists = await this.userRepository.findOne({
      where: {
        email: user.email,
        id: user.id,
        password: await Crypto.hashify('sha256', oldPassword),
      },
    });
    if (!userExists) {
      throw new BadRequestException(
        'could not update password, please check and make sure your input is correct.',
      );
    }

    const hashedPassword = await Crypto.hashify('sha256', password);

    await this.userRepository.update(
      { email: user.email, id: user.id },
      { password: hashedPassword },
    );
    await this.hostRepository.updateHostPassword(user.email, hashedPassword);
  }

  private async generateAccessToken(payload: JWTUser) {
    return await this.jwtService.signAsync({
      email: payload.email,
      id: payload.id,
    });
  }

  private async generateRefreshToken(payload: JWTUser) {
    const token = await this.jwtService.signAsync(
      { email: payload.email, id: payload.id },
      { expiresIn: '7d' },
    );
    await this.tokenRepo.createToken({
      refereshToken: token,
      tokenId: payload.id,
    });
    return token;
  }
}
