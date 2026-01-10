import { Global, Module } from '@nestjs/common';
import { AppClient } from './app-client';
import { AppClientModules } from './app-client.modules';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';

@Global()
@Module({
  imports: [DiscoveryModule, ...AppClientModules],
  providers: [AppClient],
  exports: [AppClient],
})
export class AppClientModule {}
