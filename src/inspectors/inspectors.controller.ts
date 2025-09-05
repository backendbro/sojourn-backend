import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InspectorsDto } from 'src/validators/inspectors-validators';
import { InspectorsService } from './inspectors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionInterceptor } from 'src/interceptors/transaction.interceptor';

@Controller('inspectors')
export class InspectorsController {
  constructor(private inspectorsService: InspectorsService) {}

  @UseInterceptors(FileInterceptor('photo'))
  @UseInterceptors(TransactionInterceptor)
  @Post()
  async createInspector(
    @UploadedFile() file: Express.Multer.File,
    @Body() inspector: InspectorsDto,
  ) {
    return await this.inspectorsService.createInspector(inspector, file);
  }

  @Get()
  async getInspectors() {
    return await this.inspectorsService.getInspectors();
  }

  @Get('/:id')
  async getInspectorsByInspectionId(@Param('id') id: string) {
    return await this.inspectorsService.getInspectorsByInspectionId(id);
  }
}
