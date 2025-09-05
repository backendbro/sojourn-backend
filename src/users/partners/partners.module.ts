import { Module } from '@nestjs/common';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostProfile, User } from '../entities/users.entity';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { GuestRepository } from 'src/repositories/guest.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [PartnersController],
  providers: [
    PartnersService,
    FileStorageService,
    HostsRepository,
    GuestRepository,
    HostProfile,
  ],
})
export class PartnersModule {}
