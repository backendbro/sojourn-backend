import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from './auth-custom-decorators';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN, ADMIN_TOKEN } from 'src/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { accessToken, adminAccessToken } =
      this.extractTokenFromCookies(request);

    if (!accessToken && !adminAccessToken) {
      console.log('NO ACCESS OR ADMIN TOKEN');
      throw new UnauthorizedException();
    }

    try {
      if (request.headers['x-user-type'] === 'user') {
        if (accessToken) {
          const payload = await this.jwtService.verifyAsync(accessToken, {
            secret: this.config.get('JWT_SECRET'),
          });

          request['user'] = payload;
        }
      }

      if (request.headers['x-user-type'] === 'office') {
        if (adminAccessToken) {
          const payload = await this.jwtService.verifyAsync(adminAccessToken, {
            secret: this.config.get('JWT_SECRET'),
          });

          request['admin'] = payload;
        }
      }
    } catch (error) {
      Logger.error(error);
      throw new ForbiddenException();
    }
    return true;
  }

  private extractTokenFromCookies(request: Request) {
    const accessToken = request.cookies[ACCESS_TOKEN];
    const adminAccessToken = request.cookies[ADMIN_TOKEN];
    return { accessToken, adminAccessToken };
  }
}
