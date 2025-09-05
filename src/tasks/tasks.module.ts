import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { StaticPaymentRepository } from 'src/repositories/payment.repository';
import { StaticReferalsRepository } from 'src/repositories/referals.repository';
import { StaticSojournCreditsRepository } from 'src/repositories/credits.repository';
import { StaticBookingsRepository } from 'src/repositories/bookings.repository';

@Module({
  providers: [
    {
      provide: 'TasksService', // Use a unique token
      useClass: TasksService,
    },
    {
      provide: 'StaticSojournCreditsRepository', // Use a unique token
      useClass: StaticSojournCreditsRepository,
    },
    {
      provide: 'StaticReferalsRepository', // Use a unique token
      useClass: StaticReferalsRepository,
    },
    {
      provide: 'StaticPaymentRepository', // Use a unique token
      useClass: StaticPaymentRepository,
    },
    {
      provide: 'StaticBookingsRepository',
      useClass: StaticBookingsRepository,
    },
  ],
  exports: [
    'TasksService',
    'StaticSojournCreditsRepository',
    'StaticReferalsRepository',
    'StaticPaymentRepository',
  ],
})
export class TasksModule {}
