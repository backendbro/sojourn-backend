import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { UserProfileType, UserType } from './types';
import { removeMissingValues } from 'src/utils/user-utils';
import { UserActiveStatusValidDto } from 'src/validators/admin-validators';
import { profile } from 'console';

@Controller('guests')
export class GuestsController {
  constructor(private guestService: GuestsService) {}

  @Get()
  async getAllUsers() {
    return await this.guestService.getAllUsers();
  }

  @Post('/active')
  async changeActiveStatus(@Body() dto: UserActiveStatusValidDto) {
    return await this.guestService.update(dto);
  }

  @Get('/me')
  async getUser(@Req() req: Request) {
    return await this.guestService.getUser(
      (req.user as { email: string }).email,
    );
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(TransactionInterceptor)
  @Put('/profile/update')
  async updateGuest(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      user: Partial<UserType>;
      profile: Partial<UserProfileType>;
      id: string;
    },
  ) {
    let imageUrl = null;
    if (file) {
      imageUrl = await this.guestService.uploadProfilePhoto(body.id, file);
    }

    const countUserKeys = Object.keys(body.user);
    const countUserProfileKeys = Object.keys(
      removeMissingValues(JSON.parse(body.profile as string)),
    );

    const data = {
      ...body,
      ...(countUserKeys.length && { user: JSON.parse(body.user as string) }),
      ...((countUserProfileKeys.length || imageUrl) && {
        profile: {
          ...removeMissingValues(JSON.parse(body.profile as string)),
          ...(imageUrl && { photo: imageUrl }),
        },
      }),
    };

    return await this.guestService.updateUser(data);
  }

  @Get('/profile/:id')
  async getHostProfileById(@Param('id') id: string) {
    return this.guestService.getUserProfileById(id);
  }
}
