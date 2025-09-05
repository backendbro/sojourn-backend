import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserProfile } from '../entities/users.entity';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { GuestRepository } from 'src/repositories/guest.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  providers: [
    GuestsService,
    HostsRepository,
    FileStorageService,
    GuestRepository,
  ],
  controllers: [GuestsController],
})
export class GuestModule {}
