import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './libs/auth/auth.module';
import { UserModule } from './libs/user/user.module';
import { TypeOrmConfig } from './config/db.config';
import { StorageModule } from './libs/storage/storage.module';
import { GatewayModule } from './libs/gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.dev'] }),
    TypeOrmModule.forRoot(TypeOrmConfig),
    AuthModule,
    UserModule,
    StorageModule,
    GatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
