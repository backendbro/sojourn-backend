import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from 'src/repositories/admin.repository';
import { BookingsRepository } from 'src/repositories/bookings.repository';
import { GuestRepository } from 'src/repositories/guest.repository';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { ReviewsRepository } from 'src/repositories/reviews.repository';
import { RatesRepository } from 'src/repositories/rates.repository';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    BookingsRepository,
    GuestRepository,
    HostsRepository,
    PropertiesRepository,
    PaymentRepository,
    ReviewsRepository,
    RatesRepository,
  ],
  exports: [AdminService],
})
export class AdminModule {
  //   constructor(private admin: AdminRepository) {}
  //   async onModuleInit() {
  //     const admin: IAdmin = {
  //       firstName: 'gocho',
  //       lastName: 'Imanche',
  //       email: 'office@sojourn.ng',
  //       password: await Crypto.hashify('sha256', 'password'),
  //       role: ROLES.SUPER_ADMIN,
  //     };
  //     await this.admin.createAdmin(admin);
  //   }
}
