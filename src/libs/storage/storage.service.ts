import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StorageItemEntity } from '../entities/storage-item.entity';
import sharp from 'sharp';
import { supportedImageMimeTypes } from './storage.type';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private client!: S3Client;

  private bucket!: string;

  private MAX_FILESIZE!: number;

  constructor(
    private readonly config: ConfigService,
    @InjectDataSource() private readonly datasource: DataSource,
  ) {}

  onModuleInit() {
    this.client = new S3Client({
      endpoint: this.config.getOrThrow<string>('S3_ENDPOINT'),
      region: this.config.getOrThrow<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });

    this.bucket = this.config.getOrThrow<string>('S3_BUCKET_NAME');
    this.MAX_FILESIZE = parseInt(
      this.config.getOrThrow<string>('S3_MAX_FILESIZE'),
    );
  }

  public async download(storageItemId: string) {
    const storageItem = await this.datasource.manager.findOneBy(
      StorageItemEntity,
      { id: storageItemId },
    );
    if (!storageItem)
      throw new HttpException('Storage item not found', HttpStatus.NOT_FOUND);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: String(storageItem.path),
    });

    try {
      const response = await this.client.send(command);
      if (!response.Body || !(response.Body instanceof Readable)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      return {
        stream: response.Body as Readable,
        filename: storageItem.originalname,
        contentType: storageItem.mimetype,
      };
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to download file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async upload(
    file: Express.Multer.File,
    options?: { imageCheck?: boolean },
  ) {
    try {
      if (!file.buffer)
        throw new HttpException(
          'File content not found',
          HttpStatus.BAD_REQUEST,
        );
      if (file.size > this.MAX_FILESIZE)
        throw new HttpException(
          'File size limit reached',
          HttpStatus.PAYLOAD_TOO_LARGE,
        );

      if (
        options &&
        options.imageCheck &&
        !supportedImageMimeTypes.has(file.mimetype)
      ) {
        throw new HttpException(
          'Unsupported image format',
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }
      const uid = randomUUID();
      const key = `chat-app/${uid}/${file.originalname}`;
      const thumbnailKey = `chat-app/${uid}/thumbnail-${file.originalname}`;
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      let thumbnailBuffer: Buffer | null = null;
      if (supportedImageMimeTypes.has(file.mimetype)) {
        if (file.originalname.endsWith('.gif')) {
          thumbnailBuffer = await sharp(file.buffer, { animated: true })
            .resize(256, 256)
            .toBuffer();
        } else {
          thumbnailBuffer = await sharp(file.buffer)
            .resize(256, 256)
            .toBuffer();
        }
        const thumbnailCommand = new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: file.mimetype,
        });
        await this.client.send(thumbnailCommand);
      }

      const storageItem = this.datasource.manager.create(StorageItemEntity, {
        id: randomUUID(),
        mimetype: file.mimetype,
        originalname: file.originalname,
        path: key,
        size: file.size,
        filename: file.filename,
        thumbnail_path: thumbnailBuffer === null ? null : thumbnailKey,
      } satisfies StorageItemEntity);

      await Promise.all([
        this.datasource.manager.save(StorageItemEntity, storageItem),
        this.client.send(command),
      ]);

      return storageItem;
    } catch (error: any) {
      throw error;
    }
  }

  public async remove(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: String(key),
    });

    try {
      await this.client.send(command);
    } catch (error: any) {
      throw error;
    }
  }
}
