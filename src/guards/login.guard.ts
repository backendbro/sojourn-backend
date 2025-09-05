import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}

async function validateRequest(params: any): Promise<any> {
  const origin: string | undefined = params.headers.origin;
  const url = (origin as string).split(':')[1];
  const subdomain = url.substring(2);
  //   check if user is trying to login from the right page
  return true;
}
