import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  SESv2Client,
  CreateEmailTemplateCommand,
  DeleteEmailTemplateCommand,
} from '@aws-sdk/client-sesv2';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

import { EmailServiceService } from './email-service.service';
import * as templates from './email-templates';
import { EmailController } from './email-service.controller';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailServiceService],
  exports: [EmailServiceService],
})
// export class EmailServiceModule implements OnModuleInit {
//   constructor(private configService: ConfigService) {}

//   async onModuleInit() {
//     const s3 = new S3Client({
//       region: this.configService.get('S3_BUCKET_REGION'),
//       credentials: {
//         accessKeyId: this.configService.get('S3_BUCKET_ACCESS_KEY'),
//         secretAccessKey: this.configService.get('S3_BUCKET_ACCESS_SECRET'),
//       },
//     });

//     const titlesOfImages: string[] = fs.readdirSync('src/email-service/images');
//     await Promise.all(
//       titlesOfImages.map(async (imageTitle) => {
//         const imageContent = await fs.promises.readFile(
//           `src/email-service/images/${imageTitle}`,
//         );
//         const command = new PutObjectCommand({
//           Key: `public/images/emails/${imageTitle}`,
//           Body: imageContent,
//           Bucket: this.configService.get('S3_BUCKET_NAME'),
//           ContentType: `image/${imageTitle.split('.').pop()}`,
//         });
//         await s3.send(command);
//       }),
//     );

//     const ses = new SESv2Client({
//       region: this.configService.get('S3_BUCKET_REGION'),
//       credentials: {
//         accessKeyId: this.configService.get('SES_ACCESS_KEY'),
//         secretAccessKey: this.configService.get('SES_ACCESS_SECRET'),
//       },
//     });

//     for (const template in templates) {
//       try {
//         await ses.send(
//           new DeleteEmailTemplateCommand({
//             TemplateName: template,
//           }),
//         );
//       } catch (err) {}

//       await ses.send(
//         new CreateEmailTemplateCommand({
//           TemplateName: template,
//           TemplateContent: templates[template],
//         }),
//       );
//     }
//   }
// }
export class EmailServiceModule {}
