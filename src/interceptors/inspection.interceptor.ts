import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { parseInspectionRequest } from 'src/utils/property-utils';

@Injectable()
export class InspectionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    request.body = parseInspectionRequest(request.body);
    return next.handle();
  }
}
