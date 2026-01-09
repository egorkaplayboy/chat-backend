import { Injectable } from '@nestjs/common';
import {
  AppServices,
  ServiceInstances,
  ServiceMethod,
  ServiceMethodArgs,
  ServiceMethodReturn,
  ServiceName,
} from './app-client.type';
import { ModuleRef } from '@nestjs/core';
import { AppServicesMap } from './app-client.map';

@Injectable()
export class AppClient {
  constructor(private moduleRef: ModuleRef) {}

  private serviceInstanceMap = new Map<
    ServiceName,
    InstanceType<AppServices[ServiceName]>
  >();

  private getService<S extends ServiceName>(
    serviceName: S,
  ): ServiceInstances[S] {
    if (!this.serviceInstanceMap.has(serviceName)) {
      const ServiceClass = AppServicesMap[serviceName];
      const instance = this.moduleRef.get(ServiceClass, {
        strict: false,
      });
      this.serviceInstanceMap.set(serviceName, instance);
    }

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
}
