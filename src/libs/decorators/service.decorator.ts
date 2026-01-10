import { Injectable, SetMetadata } from '@nestjs/common';
import { ServiceName } from 'src/app-client/app-client.type';

export const SERVICE_METADATA = 'SERVICE_METADATA';

export function Service(name: ServiceName): ClassDecorator {
  return (target: any) => {
    Injectable()(target);
    SetMetadata(SERVICE_METADATA, name)(target);
  };
}
