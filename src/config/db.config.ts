import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.dev', override: true });

export const TypeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  synchronize: true,
  migrationsTableName: 'migrations',
  entities: [`${__dirname}/../libs/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
  migrationsTransactionMode: 'each',
};

export default new DataSource(TypeOrmConfig);
