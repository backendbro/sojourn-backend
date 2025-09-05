import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InspectorsRepository } from 'src/repositories/inspectors.repository';
import { IInspectors } from './types';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { INSPECTORS_PHOTO_DIR_NAME } from 'src/constants';

@Injectable()
export class InspectorsService {
  constructor(
    private inspectors: InspectorsRepository,
    private fileStorageService: FileStorageService,
  ) {}

  async createInspector(inspector: IInspectors, file: Express.Multer.File) {
    try {
      const existingInspector = await this.inspectors.getInspectorByEmail(
        inspector.email,
      );

      if (existingInspector) {
        Logger.error(`inspector with email ${inspector.email} already exists.`);
        throw new BadRequestException(
          `inspector with email ${inspector.email} already exists.`,
        );
      }
      const photo = await this.uploadInspectorPhoto(file);
      return await this.inspectors.createInspector({ ...inspector, photo });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'something went wrong, please try again.',
      );
    }
  }

  async getInspectors() {
    return await this.inspectors.getInspectors();
  }

  async getInspectorsByInspectionId(id: string) {
    return await this.inspectors.getInspectorsByInspectionId(id);
  }

  private async uploadInspectorPhoto(image: Express.Multer.File) {
    try {
      image.originalname = this.fileStorageService.getSingleBucketKey(
        image,
        INSPECTORS_PHOTO_DIR_NAME,
      );
      await this.fileStorageService.uploadFile(image);
      return this.fileStorageService.getFileURL(image);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
