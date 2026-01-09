import { AppServicesMap } from './app-client.map';

export type AppServices = typeof AppServicesMap;
export type ServiceName = keyof AppServices;

export type ServiceInstances = {
  [K in ServiceName]: InstanceType<AppServices[K]>;
};

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type ServiceMethod<S extends ServiceName> = FunctionPropertyNames<
  ServiceInstances[S]
>;

export type ServiceMethodArgs<
  S extends ServiceName,
  M extends ServiceMethod<S>,
> = ServiceInstances[S][M] extends (...args: infer A) => any ? A : never;

export type ServiceMethodReturn<
  S extends ServiceName,
  M extends ServiceMethod<S>,
> = ServiceInstances[S][M] extends (...args: any[]) => infer R ? R : never;
