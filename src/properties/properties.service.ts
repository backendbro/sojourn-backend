import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Log } from 'src/utils/log-utils';
import {
  CreateInspectionForm,
  CreateProperty,
  PropertyInspectionStatus,
  PropertySearchQueriesKeys,
  PropertyStatus,
} from './types';
import { PropertyInspectionRepository } from 'src/repositories/property-inpsection.repository';
import { PropertiesRepository } from 'src/repositories/properties.repository';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { numberOfNights } from 'src/utils';
import { formatPropertyTypes } from 'src/utils/property-utils';
import { InspectorsRepository } from 'src/repositories/inspectors.repository';
import { Inspectors } from 'src/inspectors/entities/inspectors.entity';

@Injectable()
export class PropertiesService {
  constructor(
    private propertyInspectionRepository: PropertyInspectionRepository,
    private propertiesRepository: PropertiesRepository,
    private fileStorageService: FileStorageService,
    private inspectors: InspectorsRepository,
  ) {}

  async createPropertyInspection(inspectionRequest: CreateInspectionForm) {
    try {
      Logger.log(
        new Log('create inspection request and inspection triggered for:', {
          email: Log.escapeEmail(inspectionRequest.title),
        }),
      );

      const { inspectionDate, inspectionTime, ...rest } = inspectionRequest;

      const today = new Date();

      const numberOfDaysToInspection = numberOfNights(today, inspectionDate);
      if (numberOfDaysToInspection < 1) {
        throw new BadRequestException(
          'Inspection date cannot be before or equal to current day.',
        );
      }

      const property = await this.createProperty(rest);

      Logger.log(
        new Log('property created: :', {
          email: Log.escapeEmail(JSON.stringify(property)),
        }),
      );

      const propertyInspection =
        await this.propertyInspectionRepository.createPropertyInspection(
          inspectionRequest,
          property,
        );

      Logger.log(
        new Log('property inspection created: :', {
          email: Log.escapeEmail(JSON.stringify(propertyInspection)),
        }),
      );

      return propertyInspection;
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(
        'An error occurred when creating the property.',
      );
    }
  }

  async createProperty(inspectionRequest: CreateProperty) {
    try {
      Logger.log(
        new Log('create property triggered for:', {
          email: Log.escapeEmail(inspectionRequest.title),
        }),
      );

      const property =
        await this.propertiesRepository.createProperty(inspectionRequest);
      return property;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getInspections(id: string) {
    return await this.propertyInspectionRepository.getAllPropertyInspections(
      id,
    );
  }

  async getAllInspections() {
    return await this.propertyInspectionRepository.getAllInspections();
  }

  async getAllProperties() {
    return await this.propertiesRepository.getAll();
  }

  async getProperties(id: string) {
    return await this.propertiesRepository.getAllProperty(id);
  }

  async getRecommendedPropertiesTabs(limit: number) {
    return await this.propertiesRepository.getRecommendedProperties(limit);
  }

  async getRecommendedPropertiesByCity(city: string, limit: number) {
    return await this.propertiesRepository.getRecommendedPropertiesByCity(
      city,
      limit,
    );
  }

  async findPropertiesBySearch(values: PropertySearchQueriesKeys) {
    const {
      typesOfProperty,
      numberOfRooms,
      amenities,
      price,
      cursor,
      adults,
      children,
    } = values;

    const rooms = numberOfRooms
      ? numberOfRooms
          .trim()
          .split(',')
          .filter((v) => !!v)
      : [];
    const validPropertyTypes = typesOfProperty
      ? typesOfProperty.trim().split(',')
      : [];
    const validAmenities = amenities ? amenities.trim().split(',') : [];

    const propertyTypes = formatPropertyTypes(validPropertyTypes);
    return this.propertiesRepository.findPropertiesByParams({
      ...values,
      numberOfRooms: rooms,
      typesOfProperty: propertyTypes,
      amenities: validAmenities,
      price: !isNaN(+price) ? +price : 0,
      cursor: +String(cursor).trim(),
      adults: +adults,
      children: +children,
    });
  }

  async getPropertyById(id: string) {
    return await this.propertiesRepository.getPropertyById(id);
  }

  async getInspectionById(id: string) {
    return await this.propertyInspectionRepository.getInspectionById(id);
  }

  async updatePropertyById(id: string, property: Partial<CreateProperty>) {
    const existingProperty =
      await this.propertiesRepository.getHostByPropertyId(id);

    if (
      !existingProperty?.host ||
      existingProperty?.host?.id !== property.hostId
    ) {
      throw new NotFoundException('host not found for this property');
    }

    const isPropertyInspectionApproved =
      await this.propertiesRepository.isPropertyInspectionApproved(id);
    if (!isPropertyInspectionApproved) {
      throw new NotFoundException('property inspection not approved');
    }

    let tempProperty = null;
    if (
      property.activeStatus &&
      property.activeStatus === 'active' &&
      isPropertyInspectionApproved
    ) {
      tempProperty = { ...property, activeStatus: PropertyStatus.ACTIVE };
    } else if (
      property.activeStatus &&
      property.activeStatus === 'deactivated'
    ) {
      tempProperty = {
        ...property,
        activeStatus: PropertyStatus.DEACTIVATED,
      };
    } else {
      tempProperty = property;
    }

    return await this.propertiesRepository.updateProperty(id, tempProperty);
  }

  async updateInspectionById(
    id: string,
    inspection: Partial<CreateInspectionForm>,
  ) {
    let inspector: Inspectors;
    let status: PropertyInspectionStatus = PropertyInspectionStatus.PENDING;
    if (inspection.inspectorId) {
      inspector = await this.inspectors.getInspectorById(
        inspection.inspectorId,
      );
      if (!inspector) {
        throw new BadRequestException('inspector does not exist.');
      }
    }

    if (inspection.inspectionStatus) {
      switch (inspection.inspectionStatus) {
        case 'approved':
          status = PropertyInspectionStatus.APPROVED;
          break;
        case 'cancelled':
          status = PropertyInspectionStatus.CANCELLED;
          break;
        default:
          status = PropertyInspectionStatus.PENDING;
          break;
      }
    }

    delete inspection.inspectionStatus;

    await this.propertyInspectionRepository.updateInspection(id, {
      ...inspection,
      inspector,
      status,
      ...(status === PropertyInspectionStatus.APPROVED && {
        dateApproved: new Date(),
      }),
    });
    let tempProperty = {
      activeStatus: PropertyStatus.DEACTIVATED,
    };
    switch (status) {
      case PropertyInspectionStatus.APPROVED:
        tempProperty.activeStatus = PropertyStatus.ACTIVE;
        break;
      case PropertyInspectionStatus.PENDING:
        tempProperty.activeStatus = PropertyStatus.DEACTIVATED;
        break;
      case PropertyInspectionStatus.CANCELLED:
        tempProperty.activeStatus = PropertyStatus.DEACTIVATED;
        break;
      default:
        tempProperty.activeStatus = PropertyStatus.DEACTIVATED;
    }

    const property =
      await this.propertiesRepository.getPropertyByInspectionId(id);

    await this.propertiesRepository.updateProperty(property.id, tempProperty);

    return;
  }

  async uploadPropertyPhotos(id: string, images: Array<Express.Multer.File>) {
    try {
      const imagesOwnedByAuthedUserCount =
        await this.fileStorageService.getImagesCount(id);
      if (imagesOwnedByAuthedUserCount >= 100) {
        throw new BadRequestException(
          'Unable to store new files for your account. Your account has reached the limit of files stored.',
        );
      }

      return Promise.all(
        images.map(async (image) => {
          image.originalname = this.fileStorageService.getBucketKey(id, image);
          await this.fileStorageService.uploadFile(image);
          return this.fileStorageService.getFileURL(image);
        }),
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Sorry, we could not upload your images at this time. try again',
      );
    }
  }

  async cancelInspectionById(inspectionId: string) {
    try {
      return await this.propertyInspectionRepository.cancelInspectionById(
        inspectionId,
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Sorry, we could not cancel this inspection at this time',
      );
    }
  }
}
