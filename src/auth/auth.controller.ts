import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateAccountDto,
  CreateAccountWithGoogleDto,
  PasswordResetConfirmationDto,
  PasswordResetDto,
  ResendEmailConfirmationDto,
  UpdatePasswordDto,
  VerifyEmailDto,
} from 'src/validators/user-validators';
import {
  GoogleLoginDto,
  HostAccountCreation,
  JWTUser,
  LoginDto,
} from './types';
import { Public } from 'src/auth/auth-custom-decorators';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  CURRENT_ROLE_KEY,
  HOST_ACCESS_TOKEN,
  CSRF_COOKIE_NAME,
  ADMIN_TOKEN,
  ADMIN_REFERESH_TOKEN,
  ADMIN_REFRESH_TOKEN,
} from 'src/constants';
import { AdminLoginDto } from 'src/validators/admin-validators';
import { generateCsrfToken } from './csrf.middleware';
import { AdminService } from 'src/admin/admin.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
  ) {}

  @Get('csrf-token')
  getToken(@Req() req: Request) {
    const token = generateCsrfToken(req, req.cookies['csrf-secret']);
    return { csrfToken: token };
  }

  @Public()
  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return await this.authService.createAccount(createAccountDto);
  }

  @Public()
  @Post('/google/signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAccountWithGoogle(
    @Body() createAccountDto: CreateAccountWithGoogleDto,
  ) {
    return await this.authService.createAccountWithGoogle(createAccountDto);
  }

  @Public()
  @Post('/hosts/signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createHostAccount(@Body() createAccountDto: HostAccountCreation) {
    return await this.authService.createHostAccount(createAccountDto);
  }

  @Public()
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Req() request: Request,
  ) {
    const { accessToken, refreshToken, path } =
      await this.authService.login(loginDto);

    res.cookie(ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: true,
      domain: 'sojourn.ng',
      sameSite: 'strict',
    });
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      domain: 'sojourn.ng',
      sameSite: 'strict',
    });
    res.status(HttpStatus.OK).json({ message: HttpStatus.OK, path });
  }

  @Public()
  @Post('/google/login')
  async loginGoogle(@Body() loginDto: GoogleLoginDto, @Res() res: Response) {
    console.log('IT GOT THE LOGIN WITH GOOGLE');
    const { accessToken, refreshToken, path } =
      await this.authService.loginWithGoogle(loginDto);

    res.cookie(ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      domain: 'sojourn.ng',
      secure: true,
      sameSite: 'strict',
    });
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      domain: 'sojourn.ng',
      sameSite: 'strict',
    });

    console.log(`From auth controller: ${{ accessToken, refreshToken, path }}`);
    res.status(HttpStatus.OK).json({ message: HttpStatus.OK, path });
  }

  @Public()
  @Post('/reset-password')
  async resetPasswordRequest(@Body() body: PasswordResetDto) {
    return await this.authService.resetPassword(body.email);
  }

  @Public()
  @Post('/reset-password/confirm')
  async resetPassword(@Body() body: PasswordResetConfirmationDto) {
    return await this.authService.resetPasswordConfirmation(
      body.id,
      body.code,
      body.password,
    );
  }

  @Public()
  @Post('/resend-email')
  async resendEmail(@Body() body: ResendEmailConfirmationDto) {
    return await this.authService.resendConfirmationEmail(body.email);
  }

  @Public()
  @Post('/verify')
  async verify(@Body() body: VerifyEmailDto) {
    await this.authService.verifyAccount(body.id, body.code);
  }

  //only admin
  @Get('/admin/:userId')
  async impersonateUser(@Param('userId') userId: string, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.copyUser(userId);
    res.cookie(ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: true,
      domain: 'sojourn.ng',
      sameSite: 'strict',
    });
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      domain: 'sojourn.ng',
      sameSite: 'strict',
    });
    res.status(HttpStatus.OK).json({ message: HttpStatus.OK });
  }

  @Public()
  @Post('/admin/login')
  async adminLogin(@Body() admin: AdminLoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.adminLogin(admin);

    res.cookie(ADMIN_TOKEN, accessToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie(ADMIN_REFERESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(HttpStatus.OK).json({ message: HttpStatus.OK });
  }

  @Public()
  @Patch('/admin/update-password')
  async updateAdminPassword(
    @Body() body: { email: string; newPassword: string },
    @Res() res: Response,
  ) {
    await this.adminService.updateAdminPassword(body.email, body.newPassword);

    // Clear auth cookies
    res.clearCookie(ADMIN_TOKEN, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    res.clearCookie(ADMIN_REFERESH_TOKEN, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    return res.status(HttpStatus.OK).json({
      message: 'Password updated. Please log in again.',
    });
  }

  @Public()
  @Get('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const role = req.cookies[CURRENT_ROLE_KEY];
    const accessTokenKey = role === 'host' ? HOST_ACCESS_TOKEN : ACCESS_TOKEN;
    const accessToken = await this.authService.refreshClientToken(req, res);
    res
      .cookie(accessTokenKey, accessToken, {
        httpOnly: true,
        secure: true,
        domain: 'sojourn.ng',
        sameSite: 'strict',
      })
      .sendStatus(HttpStatus.OK);
  }

  @Public()
  @Get('refresh-admin')
  async refreshAdminToken(@Req() req: Request, @Res() res: Response) {
    const accessTokenKey = ADMIN_TOKEN;
    const accessToken = await this.authService.refreshAdminToken(req, res);
    res
      .cookie(accessTokenKey, accessToken, {
        httpOnly: true,
        secure: false,
      })
      .sendStatus(HttpStatus.OK);
  }

  @Get('logout')
  async logoutHost(@Res() res: Response) {
    res.clearCookie(ACCESS_TOKEN, {
      domain: 'sojourn.ng',
      sameSite: 'strict',
      httpOnly: true,
      secure: true,
    });
    res.clearCookie(REFRESH_TOKEN, {
      domain: 'sojourn.ng',
      sameSite: 'strict',
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(HttpStatus.OK);
  }

  @Get('logout-admin')
  async logoutAdmin(@Res() res: Response) {
    res.clearCookie(ADMIN_TOKEN);
    res.clearCookie(ADMIN_REFRESH_TOKEN);
    return res.sendStatus(HttpStatus.OK);
  }

  @Put('/user/update-password')
  async updatePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: UpdatePasswordDto,
  ) {
    await this.authService.updatePassword(req.user as JWTUser, dto);
    return res.sendStatus(HttpStatus.CREATED);
  }
}
