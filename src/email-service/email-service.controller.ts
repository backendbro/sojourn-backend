import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { EmailServiceService } from './email-service.service';
import { Public } from 'src/auth/auth-custom-decorators';
import { ContactUsDto } from 'src/validators/email-validators';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailServiceService) {}

  @Public()
  @Post('/contact-us')
  async contactUs(@Body() dto: ContactUsDto) {
    this.emailService.sendContactUsMail(dto);
    return HttpStatus.OK;
  }
}
