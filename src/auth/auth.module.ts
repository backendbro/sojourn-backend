import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';

import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Host,
  HostProfile,
  User,
  UserProfile,
} from 'src/users/entities/users.entity';
import { GoogleStrategy } from './strategy/google.strategy';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { AccountCreationEventHandler } from './events/account.event';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailServiceModule } from 'src/email-service/email-service.module';
import { TokenRepository } from 'src/repositories/token.repository';
import { AdminRepository } from 'src/repositories/admin.repository';
import { AdminService } from 'src/admin/admin.service';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { ReviewsRepository } from 'src/repositories/reviews.repository';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { RatesRepository } from 'src/repositories/rates.repository';
import { GoogleAuthController } from './google.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    CacheModule.register(),
    EmailServiceModule,
    // PassportModule.register({ defaultStrategy: 'google' }),
    TypeOrmModule.forFeature([User, UserProfile, Host, HostProfile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: `${config.get('JWT_TTL')}s` },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    AccountCreationEventHandler,
    TokenRepository,
    AdminRepository,
    AdminService,
    BookingsRepository,
    GuestRepository,
    HostsRepository,
    PropertiesRepository,
    PaymentRepository,
    ReviewsRepository,
    RatesRepository,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
