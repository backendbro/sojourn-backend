import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from './base.repository';
import { DataSource } from 'typeorm';
import { RefereshToken } from '../auth/entities/token.entity';
import { CreateRefereshTokenType } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class TokenRepository extends BaseRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async invalidateAllTokensById(tokenId: string) {
    const repo = this.getRepository(RefereshToken);
    return await repo.delete({ tokenId });
  }

  async removeToken(refereshToken: string) {
    const repo = this.getRepository(RefereshToken);
    return await repo.delete({ refereshToken });
  }

  async createToken(token: CreateRefereshTokenType) {
    const repo = this.getRepository(RefereshToken);
    const refereshTokenObj = repo.create(token);
    await repo.save(refereshTokenObj);
  }

  async getToken({ userId, token }: { userId: string; token: string }) {
    const repo = this.getRepository(RefereshToken);
    return await repo.findOne({
      where: {
        tokenId: userId,
        refereshToken: token,
      },
    });
  }
}
