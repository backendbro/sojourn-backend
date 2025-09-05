import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { IAdmin } from 'src/admin/types';
import { Admin } from 'src/admin/entities/admin.entity';

@Injectable({ scope: Scope.REQUEST })
export class AdminRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  // async createAdmin(admin: IAdmin) {
  //   const repo = this.getRepository(Admin);
  //   await repo.save(repo.create(admin));
  //   return;
  // }

  async updateAdminPassword(email: string, hashedPassword: string) {
    const repo = this.getRepository(Admin);
    const admin = await repo.findOne({ where: { email } });
    console.log(admin);
    if (!admin) return null;

    admin.password = hashedPassword;
    await repo.save(admin);
    return admin;
  }

  async getAdmin(userData: { email: string; password: string }) {
    const repo = this.getRepository(Admin);
    return repo.findOne({ where: { ...userData } });
  }
}
