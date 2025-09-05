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
import { PartnersService } from './partners.service';
import { Request } from 'express';
import { Public } from 'src/auth/auth-custom-decorators';
import { HostProfileType, HostType } from './types';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { removeMissingValues } from 'src/utils/user-utils';
import { UserActiveStatusValidDto } from 'src/validators/admin-validators';

@Controller('hosts')
export class PartnersController {
  constructor(private partnersService: PartnersService) {}

  @Get()
  async getAllHosts() {
    return await this.partnersService.getAllHosts();
  }

  @Post('/active')
  async changeActiveStatus(@Body() dto: UserActiveStatusValidDto) {
    return await this.partnersService.update(dto);
  }

  @Get('/me')
  async me(@Req() req: Request) {
    return await this.partnersService.me(
      (req.user as { email: string; id: string })?.id,
    );
  }

  @Public()
  @Post('/me')
  async doesUserExist(@Body() { email }: { email: string }) {
    return await this.partnersService.postMe(email);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(TransactionInterceptor)
  @Put('/profile/update')
  async updateHost(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      host: Partial<HostType>;
      profile: Partial<HostProfileType>;
      id: string;
    },
  ) {
    let imageUrl = null;
    if (file) {
      imageUrl = await this.partnersService.uploadProfilePhoto(body.id, file);
    }
    const countHostKeys = Object.keys(body.host);
    const countHostProfileKeys = Object.keys(
      removeMissingValues(JSON.parse(body.profile as string)),
    );

    const data = {
      ...body,
      ...(countHostKeys.length && { host: JSON.parse(body.host as string) }),
      ...((countHostProfileKeys.length || imageUrl) && {
        profile: {
          ...removeMissingValues(JSON.parse(body.profile as string)),
          ...(imageUrl && { photo: imageUrl }),
        },
      }),
    };

    return await this.partnersService.updateHost(data);
  }

  @Get('/profile/:id')
  async getHostProfileById(@Param('id') id: string) {
    return this.partnersService.getHostProfileById(id);
  }
}
