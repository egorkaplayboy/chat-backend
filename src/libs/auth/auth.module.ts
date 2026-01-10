import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStartegy } from './startegies/jwt.strategy';
import { LocalStrategy } from './startegies/local.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          global: true,
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.getOrThrow<string>('JWT_EXPIRES_ACCESS'),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStartegy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
