import { Module } from '@nestjs/common';
import { ReferalsController } from './referals.controller';
import { ReferalsService } from './referals.service';
import {
  ReferalsRepository,
  StaticReferalsRepository,
} from 'src/repositories/referals.repository';
import { AccountRepository } from 'src/repositories/account.repository';

@Module({
  controllers: [ReferalsController],
  providers: [
    ReferalsService,
    ReferalsRepository,
    AccountRepository,
    StaticReferalsRepository,
  ],
})
export class ReferalsModule {}
