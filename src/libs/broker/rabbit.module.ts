import { Global, Module } from '@nestjs/common';
import { RabbitBroker } from './rabbit.broker';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [RabbitBroker],
  exports: [RabbitBroker],
})
export class RabbitBrokerModule {}
