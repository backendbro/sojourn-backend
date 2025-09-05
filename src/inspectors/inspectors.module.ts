import { Module } from '@nestjs/common';
import { InspectorsController } from './inspectors.controller';
import { InspectorsService } from './inspectors.service';
import { InspectorsRepository } from 'src/repositories/inspectors.repository';
import { FileStorageService } from 'src/file-storage/file-storage.service';

@Module({
  controllers: [InspectorsController],
  providers: [InspectorsService, InspectorsRepository, FileStorageService],
})
export class InspectorsModule {}
