import { Global, Module } from '@nestjs/common';
import { Gateway } from './gateway.gateway';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  providers: [Gateway, AuthService, UserService, JwtService],
  exports: [Gateway],
})
export class GatewayModule {}
