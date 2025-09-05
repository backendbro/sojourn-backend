import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfigService } from './config/typeorm.config';

import { AuthModule } from './auth/auth.module';
import { GuestModule } from './users/guests/guest.module';
import { PropertiesModule } from './properties/properties.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PartnersModule } from './users/partners/partners.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { WalletModule } from './wallet/wallet.module';
import { MessagesModule } from './messages/messages.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReferalsModule } from './referals/referals.module';
import { EmailServiceModule } from './email-service/email-service.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { InspectorsModule } from './inspectors/inspectors.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    CacheModule.register(),
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
      renderPath: 'public',
    }),
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfigService,
    }),
    AuthModule,
    GuestModule,
    PropertiesModule,
    PartnersModule,
    FileStorageModule,
    BookingsModule,
    PaymentsModule,
    WalletModule,
    MessagesModule,
    WishlistModule,
    ReferalsModule,
    EmailServiceModule,
    TasksModule,
    SubscriptionsModule,
    ReviewsModule,
    AdminModule,
    InspectorsModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, TypeormConfigService],
})
export class AppModule {}
