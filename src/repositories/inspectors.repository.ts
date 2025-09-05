import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource, Not } from 'typeorm';
import { IInspectors } from 'src/inspectors/types';
import { Inspectors } from 'src/inspectors/entities/inspectors.entity';
import { formatInspectors } from 'src/utils/inspectors-utils';
import { PropertyInspection } from 'src/properties/entities/property.entity';

@Injectable({ scope: Scope.REQUEST })
export class InspectorsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async createInspector(inspectors: IInspectors) {
    const repo = this.getRepository(Inspectors);
    return await repo.save(repo.create(inspectors));
  }

  async getInspectorByEmail(email: string) {
    const repo = this.getRepository(Inspectors);
    return await repo.findOne({ where: { email } });
  }

  async getInspectorById(id: string) {
    const repo = this.getRepository(Inspectors);
    return await repo.findOne({ where: { id } });
  }

  async getInspectors() {
    const repo = this.getRepository(Inspectors);
    return formatInspectors(
      await repo.find({
        select: {
          email: true,
          firstName: true,
          lastName: true,
          address: true,
          id: true,
          photo: true,
          phoneNumber: true,
          createdAt: true,
        },
      }),
    );
  }

  async getInspectorsByInspectionId(id: string) {
    const inspection = await this.getRepository(PropertyInspection).findOne({
      where: { id },
    });
    const repo = this.getRepository(Inspectors);
    return formatInspectors(
      await repo.find({
        where: {
          propertyInspection: {
            id: Not(id),
            inspectionDate: Not(inspection.inspectionDate),
          },
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          address: true,
          id: true,
          photo: true,
          phoneNumber: true,
          createdAt: true,
        },
        relations: {
          propertyInspection: true,
        },
      }),
    );
  }
}
