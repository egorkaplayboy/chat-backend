import { Injectable, SetMetadata } from '@nestjs/common';

export const COMMAND = Symbol('COMMAND');

// eslint-disable-next-line @typescript-eslint/ban-types
export const Command = () => (target: Function) => {
  Injectable()(target);
  SetMetadata(COMMAND, {
    subscribe: target.name,
  });
};
