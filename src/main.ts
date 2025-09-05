import dotenv from 'dotenv';

dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './exception-filters/global-exception.filter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
//import { csrfProtection } from './auth/csrf.middleware';

async function bootstrap() {
  console.log('We are live');
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.use(helmet({ contentSecurityPolicy: false }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('/api/v1');
  app.enableCors({
    origin: [
      'https://www.sojourn.ng',
      'https://sojourn.ng',
      'http://localhost:3000',
      'http://localhost:4000',
      'https://sojourn-frontend-api-75m1.vercel.app',
      'https://sojourn-frotend-alpha.vercel.app',
    ],
    credentials: true,
  });

  app.use(cookieParser());
  // app.use(csrfProtection);
  //await app.listen(3000);
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
