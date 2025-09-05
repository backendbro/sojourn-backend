import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { PropertyInspectionRepository } from 'src/repositories/property-inpsection.repository';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { InspectorsRepository } from 'src/repositories/inspectors.repository';

@Module({
  controllers: [PropertiesController],
  providers: [
    PropertiesService,
    PropertiesRepository,
    PropertyInspectionRepository,
    FileStorageService,
    InspectorsRepository,
  ],
})
export class PropertiesModule {}
