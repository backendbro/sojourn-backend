import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileStorageService {
  private s3: S3Client;
  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('S3_BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get('S3_BUCKET_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_BUCKET_ACCESS_SECRET'),
      },
    });
  }

  async getImagesCount(accountId: string) {
    const command = new ListObjectsCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Prefix: this.getBucketKey(accountId),
    });

    try {
      const response = await this.s3.send(command);
      return response.Contents?.length || 0;
    } catch (error) {
      Logger.log(error);
    }
  }

  getBucketKey(
    accountId: string,
    file?: Express.Multer.File,
    dirName: string = 'images',
  ): string {
    let key = `accounts/${accountId}/${dirName}/`;
    if (typeof file?.mimetype === 'string') {
      key = key + `${uuid()}.${file.mimetype.split('/').pop()}`;
    }

    return key;
  }

  getSingleBucketKey(
    file?: Express.Multer.File,
    dirName: string = 'images',
  ): string {
    let key = `accounts/${dirName}/`;
    if (typeof file?.mimetype === 'string') {
      key = key + `${uuid()}.${file.mimetype.split('/').pop()}`;
    }

    return key;
  }

  getFileURL(file: Express.Multer.File) {
    // return `${this.configService.get('SUPABASE_URL')}/object/public/sojourn_dev/${file.originalname}`;
    return `${this.configService.get('S3_URL')}/${file.originalname}`;
  }

  getFileKeyFromURL(fileURL: string) {
    return fileURL.split('.com/').pop();
  }

  async uploadFile(file: Express.Multer.File): Promise<void> {
    const command = new PutObjectCommand({
      Key: file.originalname,
      Body: file.buffer,
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      ContentType: file.mimetype,
    });

    await this.s3.send(command);
  }

  async deleteFile(fileKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Key: fileKey,
    });

    await this.s3.send(command);
  }
}
