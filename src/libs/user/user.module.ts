import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
