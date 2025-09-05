import { Injectable, Logger } from '@nestjs/common';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import {
  ContactUsEmailTemplateParams,
  EmailTemplate,
  EmailTemplateVariables,
} from './email-service.types';
import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { ContactUsDto } from 'src/validators/email-validators';

@Injectable()
export class EmailServiceService {
  private ses: SESv2Client;
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.ses = new SESv2Client({
      region: this.configService.get('S3_BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get('SES_ACCESS_KEY'),
        secretAccessKey: this.configService.get('SES_ACCESS_SECRET'),
      },
    });

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('ZOHO_SMTP_HOST'), // e.g., email-smtp.us-east-1.amazonaws.com
      port: +this.configService.get('ZOHO_SMTP_PORT'), // or 465
      secure: true, // true for port 465, false for others
      auth: {
        user: this.configService.get('ZOHO_SMTP_USER'), // Replace with AWS SES SMTP username
        pass: this.configService.get('ZOHO_SMTP_PASS'), // Replace with AWS SES SMTP password
      },
    });
  }

  async sendEmail(
    recipient: string,
    templateName: EmailTemplate,
    params: EmailTemplateVariables,
  ) {
    try {
      const templatePath = path.join(
        __dirname,
        'email-templates',
        `${templateName}.html`,
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateSource);

      // Render the template with dynamic data
      const html = template(params);

      const EmailTemplateSubjects = {
        AccountEmailVerificationEmailTemplate: 'Verify your email',
        PasswordResetEmailTemplate: 'Your password changed',
        PasswordResetRequestEmailTemplate: 'Change your password',
        GuestBookingRejectionEmailTemplate: 'Your booking was cancelled',
        GuestBookingConfirmationEmailTemplate: 'Your booking is confirmed',
        HostBookingRejectionEmailTemplate: 'Booking cancelled',
        HostBookingConfirmationEmailTemplate: 'Your have a booking',
        UpcomingBookingReminderEmailTemplate:
          'Get ready for your upcoming booking',
        SubscriptionInvoiceCreatedEmailTemplate: 'Invoice created',
        SubscriptionInvoicePaymentFailedEmailTemplate: 'Invoice payment failed',
        SubscriptionWillNotRenewEmailTemplate: 'Subscription not renewing',
        ContactUsEmailTemplate: `Message from ${(params as ContactUsEmailTemplateParams).fullName}`,
      };

      const mailOptions = {
        from: `"Sojourn" ${this.configService.get('SYSTEM_EMAIL_SENDER')}`,
        to: recipient,
        subject: EmailTemplateSubjects[templateName],
        html,
      };

      this.transporter.sendMail(mailOptions);
    } catch (error) {
      Logger.log(error.message);
      throw error;
    }
  }

  sendContactUsMail(dto: ContactUsDto) {
    const recipient = this.configService.get('SYSTEM_EMAIL_SENDER');
    const params: ContactUsEmailTemplateParams = {
      from: dto.from,
      fullName: dto.fullName,
      message: dto.message,
    };
    this.sendEmail(recipient, 'ContactUsEmailTemplate', params);
  }

  // async sendEmail(
  //   recipient: string,
  //   templateName: EmailTemplate,
  //   params: EmailTemplateVariables,
  // ) {
  //   try {
  //     const sesCommand = new SendEmailCommand({
  //       FromEmailAddress: this.configService.get('SYSTEM_EMAIL_SENDER'),
  //       ReplyToAddresses: [this.configService.get('SYSTEM_EMAIL_SENDER')],
  //       Destination: {
  //         ToAddresses: [recipient],
  //       },
  //       Content: {
  //         Template: {
  //           TemplateName: templateName,
  //           TemplateData: JSON.stringify(params),
  //         },
  //       },
  //     });

  //     await this.ses.send(sesCommand);
  //   } catch (error) {
  //     Logger.log(error);
  //   }
  // }
}
