import { Global, Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  providers: [GatewayGateway, AuthService, UserService, JwtService],
})
export class GatewayModule {}
