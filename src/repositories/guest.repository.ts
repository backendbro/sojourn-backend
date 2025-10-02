import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { User, UserProfile } from '../users/entities/users.entity';
import {
  UserActiveStatus,
  UserProfileType,
  UserType,
} from '../users/guests/types';
import { transformUsers } from '../utils/user-utils';

@Injectable({ scope: Scope.REQUEST })
export class GuestRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async count() {
    const guestRepository = this.getRepository(User);
    return await guestRepository.count();
  }

  /**
   * Get paginated users for admin
   * @param param0 optional skip/take pagination
   */
  async getAll({ skip = 0, take = 50 } = {}) {
    const guestRepository = this.getRepository(User);
    const results = await guestRepository.find({
      skip,
      take,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        active: true,
        id: true,
        createdAt: true, // <-- include signup date
        profile: {
          country: true,
          city: true, // <-- include city
          primaryPhoneNumber: true,
          photo: true,
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

  async update(id: string, status: string) {
    const repo = this.getRepository(User);
    const user = await repo.findOne({
      where: { id },
      relations: { host: true },
    });

    user.active =
      status === 'active'
        ? UserActiveStatus.ACTIVE
        : UserActiveStatus.RESTRICTED;
    await repo.save(user);
    return user;
  }

  async getGuestById(id: string) {
    return await this.getRepository(User).findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profile: {
          photo: true,
        },
      },
      relations: {
        profile: true,
      },
    });
  }

  async getGuestByEmail(email: string) {
    const repo = this.getRepository(User);
    return repo.findOne({ where: { email }, select: { id: true } });
  }

  async updateUserProfile(userProfile: Partial<UserProfileType>, id: string) {
    return await this.getRepository(UserProfile).upsert(
      {
        ...userProfile,
        ...(userProfile.dateOfBirth && {
          dateOfBirth: new Date(userProfile.dateOfBirth),
        }),
        userId: id,
      },
      {
        conflictPaths: {
          userId: true,
        },
      },
    );
  }

  async updateUser(body: {
    user: Partial<UserType>;
    profile: Partial<UserProfileType>;
    id: string;
  }) {
    await this.updateUserProfile(body.profile, body.id);
    return await this.getRepository(User).update({ id: body.id }, body.user);
  }

  async getUserProfileById(id: string) {
    const profileModel = this.getRepository(User);
    const result = await profileModel.findOne({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profile: {
          primaryPhoneNumber: true,
          governmentId: true,
          gender: true,
          dateOfBirth: true,
          zipOrPostal: true,
          photo: true,
          city: true,
          country: true,
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
