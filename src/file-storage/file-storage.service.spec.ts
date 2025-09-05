import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { FileStorageService } from './file-storage.service';

jest.mock('uuid', () => ({ v4: () => 'ade1c007-7f9c-474e-ad19-0e8f0bb9b078' }));

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: ConfigService,
          useValue: {
            get(key) {
              const config = {
                S3_BUCKET_NAME: 'bucket',
                S3_BUCKET_REGION: 'eu-central-1',
              };

              return config[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
  });

  const accountId = 7;

  it('should create a bucket key for a file', () => {
    const file = {
      mimetype: 'image/jpg',
    };
    const key = service.getBucketKey(accountId, file as Express.Multer.File);
    expect(key).toStrictEqual(
      'accounts/7/images/ade1c007-7f9c-474e-ad19-0e8f0bb9b078.jpg',
    );
  });

  it('should create a url for an uploaded file', () => {
    const file = {
      originalname: 'ade1c007-7f9c-474e-ad19-0e8f0bb9b078.jpg',
    };
    const url = service.getFileURL(file as Express.Multer.File);
    expect(url).toStrictEqual(
      'https://bucket.s3.eu-central-1.amazonaws.com/ade1c007-7f9c-474e-ad19-0e8f0bb9b078.jpg',
    );
  });

  it('should extract file key from file url', () => {
    const fileURL =
      'https://sojourn-public-media-dev.s3.eu-central-1.amazonaws.com/accounts/10/images/image.jpg';
    const fileKey = service.getFileKeyFromURL(fileURL);

    expect(fileKey).toStrictEqual('accounts/10/images/image.jpg');
  });
});
