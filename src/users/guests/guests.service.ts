import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserProfile } from '../entities/users.entity';
import { Repository } from 'typeorm';
import { HostsRepository } from 'src/repositories/hosts.repository';
import { UserProfileType, UserType } from './types';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { GuestRepository } from 'src/repositories/guest.repository';
import { UserActiveStatusValidDto } from 'src/validators/admin-validators';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private hostsRepository: HostsRepository,
    private guestsRepository: GuestRepository,
    private fileStorageService: FileStorageService,
  ) {}

  async getUser(email: string = '') {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profile: {
          photo: true,
          primaryPhoneNumber: true,
          governmentId: true,
        },
      },
      relations: {
        profile: true,
      },
    });
    const host = await this.hostsRepository.findByEmail(email);

    const userProfileComplete =
      (user?.profile ? user.profile?.governmentId : null) && user.profile
        ? user.profile?.primaryPhoneNumber
        : null;

    const hostProfileComplete = host?.profile
      ? host.profile?.governmentId && host.profile?.primaryPhoneNumber
      : null;

    return { user, host, userProfileComplete, hostProfileComplete };
  }

  async updateUser(body: {
    user: Partial<UserType>;
    profile: Partial<UserProfileType>;
    id: string;
  }) {
    try {
      return await this.guestsRepository.updateUser(body);
    } catch (error) {
      Logger.error(error);
    }
  }

  async getUserProfileById(id: string) {
    return await this.guestsRepository.getUserProfileById(id);
  }

  async getAllUsers() {
    return await this.guestsRepository.getAll();
  }

  async update(dto: UserActiveStatusValidDto) {
    const user = await this.guestsRepository.update(
      dto.userId,
      dto.activeStatus,
    );

    if (user?.host) {
      await this.hostsRepository.update(user.hostId, dto.activeStatus);
    }
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
