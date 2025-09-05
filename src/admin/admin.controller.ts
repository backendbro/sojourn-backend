import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Public } from 'src/auth/auth-custom-decorators';
import { RateDto } from 'src/validators/admin-validators';

@Controller('office')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/dashboard')
  async getDashBoardData() {
    const results = await this.adminService.getDashBoardData();
    return results;
  }

  @Post('/dollar-rate')
  async updateDollarRate(@Body() dto: RateDto) {
    return await this.adminService.createOrUpdateCurrencyRate(dto.rate);
  }
}
