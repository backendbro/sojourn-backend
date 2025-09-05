import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from 'src/auth/auth-custom-decorators';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';
import {
  CancelInspection,
  CreateInspectionRequestDTO,
} from 'src/validators/property-validators';
import { PropertiesService } from './properties.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { transformFiles } from 'src/utils/file-utils';
import { InspectionInterceptor } from 'src/interceptors/inspection.interceptor';
import { Request } from 'express';
import {
  CreateInspectionForm,
  CreateProperty,
  PropertySearchQueriesKeys,
} from './types';
import { Response } from 'express';

@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @UseInterceptors(InspectionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @UseInterceptors(TransactionInterceptor)
  @Post('/hosts/inspection')
  async createPropertyInspection(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CreateInspectionRequestDTO,
    @Req() req: Request,
  ) {
    const photos = await this.propertiesService.uploadPropertyPhotos(
      body.hostId,
      files,
    );

    return await this.propertiesService.createPropertyInspection({
      ...body,
      photos,
    });
  }

  @Get('/hosts/:id')
  async getProperties(@Param('id') id: string) {
    return await this.propertiesService.getProperties(id);
  }

  @Get('/inspections')
  async getAllInspections() {
    return await this.propertiesService.getAllInspections();
  }

  @Get('/all')
  async getAllProperties() {
    return await this.propertiesService.getAllProperties();
  }

  @Get('/hosts/inspection/:id')
  async getInspections(@Param('id') id: string) {
    return await this.propertiesService.getInspections(id);
  }

  @Get('/inspection/:id')
  async getInspection(@Param('id') id: string) {
    return await this.propertiesService.getInspectionById(id);
  }

  @Public()
  @Get('/recommended')
  async getRecommendedProperties(@Query('limit') limit: number) {
    return await this.propertiesService.getRecommendedPropertiesTabs(limit);
  }

  @Public()
  @Get('/recommended/:city')
  async getRecommendedPropertiesByCity(
    @Param('city') city: string,
    @Query('limit') limit: number = 8,
  ) {
    return await this.propertiesService.getRecommendedPropertiesByCity(
      city,
      limit,
    );
  }

  @Public()
  @Get()
  async findPropertiesBySearchValues(
    @Query() query: Promise<PropertySearchQueriesKeys>,
  ) {
    const searchParams = await query;
    return await this.propertiesService.findPropertiesBySearch(searchParams);
  }

  @Public()
  @Get('/:id')
  async getPropertyById(@Param('id') id: string) {
    return await this.propertiesService.getPropertyById(id);
  }

  @UseInterceptors(InspectionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 6))
  @Put('/hosts/update')
  async updatePropertyWithPhotos(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body()
    body: { title: string; photos: string[]; id: string; hostId: string },
    @Req() req: Request,
  ) {
    const photos = await this.propertiesService.uploadPropertyPhotos(
      body.hostId,
      files,
    );

    const property = {
      ...body,
      photos: [...body.photos, ...photos],
    };

    return await this.propertiesService.updatePropertyById(body.id, property);
  }

  @UseInterceptors(InspectionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 6))
  @Put('/hosts/inspection/update')
  async updateInspectionWithPhotos(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body()
    body: { title: string; photos: string[]; id: string; hostId: string },
    @Req() req: Request,
  ) {
    const photos = await this.propertiesService.uploadPropertyPhotos(
      body.hostId,
      files,
    );

    const property = {
      ...body,
      photos: [...body.photos, ...photos],
    };

    return await this.propertiesService.updateInspectionById(body.id, property);
  }

  @Post('/hosts/update')
  async updateProperty(@Body() body: Partial<CreateProperty> & { id: string }) {
    return await this.propertiesService.updatePropertyById(body.id, body);
  }

  @Post('/hosts/inspection/update')
  async updateInspection(
    @Body() body: Partial<CreateInspectionForm> & { id: string },
  ) {
    return await this.propertiesService.updateInspectionById(body.id, body);
  }

  @Put('/hosts/inspection/cancel')
  async cancelInspection(@Body() body: CancelInspection) {
    return await this.propertiesService.cancelInspectionById(body.inspectionId);
  }
}
