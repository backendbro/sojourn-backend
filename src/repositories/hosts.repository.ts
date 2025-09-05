import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { Host, HostProfile } from '../users/entities/users.entity';
import { HostAccountCreation } from '../auth/types';
import { HostProfileType, HostType } from '../users/partners/types';
import { transformUsers } from '../utils/user-utils';
import { UserActiveStatus } from 'src/users/guests/types';

@Injectable({ scope: Scope.REQUEST })
export class HostsRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async count() {
    return await this.getRepository(Host).count();
  }

  async updateHostPassword(email: string, password: string) {
    return await this.getRepository(Host).update({ email }, { password });
  }

  async getAll() {
    const results = await this.getRepository(Host).find({
      select: {
        id: true,
        active: true,
        email: true,
        firstName: true,
        lastName: true,
        profile: {
          photo: true,
          country: true,
          primaryPhoneNumber: true,
        },
      },
      relations: {
        profile: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return transformUsers(results);
  }

  async findOneByUserId(userId: string) {
    const repo = this.getRepository(Host);
    const user = await repo.findOne({
      where: { id: userId },
    });
    return user;
  }

  async update(id: string, status: string) {
    const repo = this.getRepository(Host);
    const user = await repo.findOne({
      where: { id },
      relations: { user: true },
    });

    user.active =
      status === 'active'
        ? UserActiveStatus.ACTIVE
        : UserActiveStatus.RESTRICTED;
    await repo.save(user);
    return user;
  }

  async findByEmail(email: string) {
    return await this.getRepository(Host).findOne({
      where: { email },
      relations: {
        profile: true,
      },
    });
  }

  async save(payload: HostAccountCreation) {
    const hostRepo = this.getRepository(Host);
    const host = hostRepo.create({
      ...payload,
      ...(payload.companyName && { profile: payload }),
    });
    return hostRepo.save(host);
  }

  async getHostByEmail(email: string) {
    const me = await this.getRepository(Host).findOne({
      where: {
        email,
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        lastName: true,
        profile: {
          photo: true,
        },
      },
      relations: {
        profile: true,
      },
    });

    if (me) {
      return {
        firstName: me?.firstName,
        lastName: me?.lastName,
        id: me?.id,
        photo: me?.profile && me?.profile?.photo ? me?.profile?.photo : '',
      };
    }

    return null;
  }

  async getHostAllFieldsById(accountId: string) {
    return await this.getRepository(Host).findOne({
      where: {
        id: accountId,
      },
    });
  }

  async getHostById(id: string) {
    const me = await this.getRepository(Host).findOne({
      where: {
        userId: id,
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        lastName: true,
        profile: {
          photo: true,
          governmentId: true,
          primaryPhoneNumber: true,
        },
      },
      relations: {
        profile: true,
      },
    });

    if (me) {
      return {
        firstName: me?.firstName,
        lastName: me?.lastName,
        id: me?.id,
        photo: me?.profile && me?.profile?.photo ? me?.profile?.photo : '',
        governmentId: me?.profile ? me.profile?.governmentId : '',
        primaryPhoneNumber: me?.profile ? me.profile?.primaryPhoneNumber : '',
      };
    }

    return null;
  }

  async updateHostProfile(hostProfle: Partial<HostProfileType>, id: string) {
    return await this.getRepository(HostProfile).upsert(
      {
        ...hostProfle,
        ...(hostProfle.dateOfBirth && {
          dateOfBirth: new Date(hostProfle.dateOfBirth),
        }),
        hostId: id,
      },
      {
        conflictPaths: {
          hostId: true,
        },
      },
    );
  }

  async updateHost(body: {
    host: Partial<HostType>;
    profile: Partial<HostProfile>;
    id: string;
  }) {
    await this.updateHostProfile(body.profile, body.id);
    return await this.getRepository(Host).update({ id: body.id }, body.host);
  }

  async getHostProfileById(id: string) {
    const profileModel = this.getRepository(Host);
    const result = await profileModel.findOne({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        accountType: true,
        profile: {
          primaryPhoneNumber: true,
          governmentId: true,
          gender: true,
          dateOfBirth: true,
          zipOrPostal: true,
          vatNumber: true,
          companyName: true,
          photo: true,
          registrationNumber: true,
          city: true,
          country: true,
          contactPersonGender: true,
          contactPersonPhoneNumber: true,
          houseNumber: true,
          state: true,
          street: true,
        },
      },
      relations: {
        profile: true,
      },
    });

    return result;
  }
}
