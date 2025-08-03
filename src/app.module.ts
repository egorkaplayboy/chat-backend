import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './libs/auth/auth.module';
import { UserModule } from './libs/user/user.module';
import { TypeOrmConfig } from './config/db.config';
import { StorageModule } from './libs/storage/storage.module';
import { GatewayModule } from './libs/gateway/gateway.module';
import { ChatModule } from './libs/chat/chat.module';
import { MessageModule } from './libs/message/message.module';
import { LoggerMiddleware } from './libs/middleware/logger.middleware';
import { MessageReactionModule } from './libs/message-reaction/message-reaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.dev'] }),
    TypeOrmModule.forRoot(TypeOrmConfig),
    AuthModule,
    UserModule,
    StorageModule,
    GatewayModule,
    ChatModule,
    MessageModule,
    MessageReactionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
