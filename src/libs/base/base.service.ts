import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { AppClient } from 'src/app-client/app-client';

@Injectable()
export abstract class BaseService {
  @InjectDataSource()
  protected readonly datasource: DataSource;

  @Inject(ConfigService)
  protected readonly config: ConfigService;

  @Inject(StorageService)
  protected readonly storage: StorageService;

  @Inject(forwardRef(() => AppClient))
  protected readonly appClient: AppClient;

  protected get manager() {
    return this.datasource.manager;
  }
}
