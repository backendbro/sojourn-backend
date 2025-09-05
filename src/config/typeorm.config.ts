import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin, Rates } from 'src/admin/entities/admin.entity';
import { RefereshToken } from 'src/auth/entities/token.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Inspectors } from 'src/inspectors/entities/inspectors.entity';
import { Message } from 'src/messages/entities/messages.entity';
import { Ticket } from 'src/messages/entities/ticket.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { SubscriptionPayment } from 'src/payments/entities/subscription-payment.entity';
import { Subscriptions } from 'src/payments/entities/subscription.entity';
import { Withdrawal } from 'src/payments/entities/withdrawal.entity';
import {
  PropertyInspection,
  Property,
} from 'src/properties/entities/property.entity';
import { Referals } from 'src/referals/entities/referals.entity';
import { Reviews } from 'src/reviews/entities/reviews.entity';
import {
  UserProfile,
  User,
  Host,
  HostProfile,
} from 'src/users/entities/users.entity';
import { Account } from 'src/wallet/entities/account.entity';
import { CrytoAccount } from 'src/wallet/entities/crypto.entity';
import { SojournCredits } from 'src/wallet/entities/sojourn-credits.entity';
import { UserAccount } from 'src/wallet/entities/user-account.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.configService.get('SJ_DATABASE_HOST'),
      port: +this.configService.get('SJ_DATABASE_PORT'),
      username: this.configService.get('SJ_DATABASE_USER'),
      password: this.configService.get('SJ_DATABASE_PASS'),
      database: this.configService.get('SJ_DATABASE_NAME'),
      entities: [
        User,
        UserProfile,
        Host,
        HostProfile,
        PropertyInspection,
        Property,
        Booking,
        Payment,
        Wallet,
        Withdrawal,
        Message,
        Ticket,
        Account,
        CrytoAccount,
        Wishlist,
        Referals,
        UserAccount,
        SojournCredits,
        Subscriptions,
        SubscriptionPayment,
        RefereshToken,
        Reviews,
        Admin,
        Inspectors,
        Rates,
      ],
      logging: false,
      migrations: [],
      synchronize: false,
    };
  }
}
