import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import {
  Property,
  PropertyInspection,
} from '../properties/entities/property.entity';
import {
  CreateInspectionForm,
  PropertyInspectionStatus,
  PropertyStatus,
} from '../properties/types';
import { transfromInspections } from '../utils/property-utils';

@Injectable({ scope: Scope.REQUEST })
export class PropertyInspectionRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getAllInspections() {
    const repo = this.getRepository(PropertyInspection);
    return transfromInspections(
      await repo.find({
        relations: {
          host: true,
        },
        order: {
          createdAt: 'DESC',
        },
      }),
    );
  }

  async getAllPropertyInspections(id: string) {
    const results = await this.getRepository(PropertyInspection).find({
      where: {
        hostId: id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return transfromInspections(results);
  }

  async createPropertyInspection(
    payload: CreateInspectionForm,
    property: Property,
  ) {
    const propertyInspectionRespository =
      this.getRepository(PropertyInspection);
    const propertyInspection = propertyInspectionRespository.create(payload);
    propertyInspection.property = property;
    return await propertyInspectionRespository.insert(propertyInspection);
  }

  async getInspectionById(id: string) {
    const propertyInspectionRespository =
      this.getRepository(PropertyInspection);
    return await propertyInspectionRespository.findOne({
      where: {
        id,
      },
      select: {
        inspector: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
      relations: {
        inspector: true,
      },
    });
  }

  async updateInspection(
    id: string,
    inspection: Partial<CreateInspectionForm>,
  ) {
    const inspectionRepository = this.getRepository(PropertyInspection);

    await inspectionRepository.update(id, inspection);
  }

  async cancelInspectionById(inspectionId: string) {
    const inspectionRepository = this.getRepository(PropertyInspection);
    const propertyRepository = this.getRepository(Property);
    const dateCancelled = new Date();

    const inspectionRecord = await inspectionRepository.findOne({
      where: { id: inspectionId },
      relations: { property: true },
    });
    inspectionRecord.status = PropertyInspectionStatus.CANCELLED;
    inspectionRecord.dateCancelled = dateCancelled;
    await inspectionRepository.save(inspectionRecord);

    const currentProperty = await propertyRepository.findOne({
      where: { id: inspectionRecord.property.id },
    });
    currentProperty.activeStatus = PropertyStatus.DEACTIVATED;
    return await propertyRepository.save(currentProperty);
  }
}
