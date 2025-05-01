import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StorageService } from '../storage/storage.service';

@Injectable()
export abstract class BaseService {
  @InjectDataSource()
  protected readonly datasource: DataSource;

  @Inject(ConfigService)
  protected readonly config: ConfigService;

  @Inject(JwtService)
  protected readonly jwt: JwtService;

  @Inject(StorageService)
  protected readonly storage: StorageService;

  protected get manager() {
    return this.datasource.manager;
  }
}
