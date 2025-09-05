import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { User } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { HostProfileType, HostType } from './types';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { UserActiveStatusValidDto } from 'src/validators/admin-validators';
import { GuestRepository } from 'src/repositories/guest.repository';

@Injectable()
export class PartnersService {
  constructor(
    private fileStorageService: FileStorageService,
    private hostsRepository: HostsRepository,
    private guestsRepository: GuestRepository,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async me(id: string) {
    if (!id) {
      return new BadRequestException('no user provided');
    }

    const user = await this.userRepository.findOne({
      where: {
        id,
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

    const host = await this.hostsRepository.getHostById(id);

    const userProfileComplete = user?.profile
      ? user.profile?.primaryPhoneNumber && user.profile?.governmentId
      : null;

    const hostProfileComplete = host?.governmentId && host?.primaryPhoneNumber;

    return { user, host, userProfileComplete, hostProfileComplete };
  }

  async postMe(email: string) {
    if (!email) {
      return new BadRequestException('Bad Request');
    }

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    const host = await this.hostsRepository.getHostByEmail(email);
    return { host, user };
  }

  async updateHost(body: {
    host: Partial<HostType>;
    profile: Partial<HostProfileType>;
    id: string;
  }) {
    try {
      return await this.hostsRepository.updateHost(body);
    } catch (error) {
      Logger.error(error);
    }
  }

  async getHostProfileById(id: string) {
    return await this.hostsRepository.getHostProfileById(id);
  }

  async getAllHosts() {
    return await this.hostsRepository.getAll();
  }

  async update(dto: UserActiveStatusValidDto) {
    const host = await this.hostsRepository.update(
      dto.userId,
      dto.activeStatus,
    );

    await this.guestsRepository.update(host.user.id, dto.activeStatus);
  }

  async uploadProfilePhoto(id: string, image: Express.Multer.File) {
    const imagesOwnedByAuthedUserCount =
      await this.fileStorageService.getImagesCount(id);
    if (imagesOwnedByAuthedUserCount >= 100) {
      throw new BadRequestException(
        'Unable to store new files for your account. Your account has reached the limit of files stored.',
      );
    }
    image.originalname = this.fileStorageService.getBucketKey(
      id,
      image,
      'profile_photos',
    );
    await this.fileStorageService.uploadFile(image);
    return this.fileStorageService.getFileURL(image);
  }
}
