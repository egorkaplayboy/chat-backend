import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ServiceInstances,
  ServiceMethod,
  ServiceMethodArgs,
  ServiceMethodReturn,
  ServiceName,
} from './app-client.type';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { SERVICE_METADATA } from 'src/libs/decorators/service.decorator';
import { RabbitBroker } from 'src/libs/broker/rabbit.broker';

@Injectable()
export class AppClient implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly broker: RabbitBroker,
  ) {}

  private readonly logger = new Logger(AppClient.name);

  private serviceInstanceMap = new Map<string, Object>();

  async onModuleInit() {
    await this.exploreServices();
  }

  private async exploreServices() {
    const providers =
      await this.discoveryService.providersWithMetaAtKey(SERVICE_METADATA);

    for (const provider of providers) {
      this.serviceInstanceMap.set(
        provider.meta as string,
        provider.discoveredClass.instance,
      );
    }

    this.logger.log(`AppClient initialized with ${providers.length} services`);
  }

  private getService<S extends ServiceName>(
    serviceName: S,
  ): ServiceInstances[S] {
    return this.serviceInstanceMap.get(serviceName) as ServiceInstances[S];
  }

  local<S extends ServiceName, M extends ServiceMethod<S>>(
    serviceName: S,
    methodName: M,
    ...args: ServiceMethodArgs<S, M>
  ): ServiceMethodReturn<S, M> {
    const service = this.getService(serviceName);
    const method = service[methodName] as (...args: any[]) => any;

    return method.apply(service, args);
  }

  async rpc<S extends ServiceName, M extends ServiceMethod<S>>(
    serviceName: S,
    methodName: M,
    ...args: ServiceMethodArgs<S, M>
  ): Promise<ServiceMethodReturn<S, M>> {
    const timeoutMs = 5000;

    return await this.broker.publish<
      ServiceMethodArgs<S, M>,
      ServiceMethodReturn<S, M>
    >(serviceName, methodName as string, args, timeoutMs);
  }

  async start<S extends ServiceName, M extends ServiceMethod<S>>(
    serviceName: S,
    methodName: M,
    ...args: ServiceMethodArgs<S, M>
  ): Promise<ServiceMethodReturn<S, M>> {
    return await this.broker.publish<
      ServiceMethodArgs<S, M>,
      ServiceMethodReturn<S, M>
    >(serviceName, methodName as string, args, undefined);
  }
}
