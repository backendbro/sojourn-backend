/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Public } from 'src/auth/auth-custom-decorators';

@Controller('google')
export class GoogleAuthController {
  constructor(private readonly http: HttpService) {}

  @Public()
  @Post('userinfo')
  async userinfo(@Body('access_token') token: string) {
    const url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`;
    const resp$ = this.http.get(url);
    const resp = await lastValueFrom(resp$);
    return resp.data;
  }
}
