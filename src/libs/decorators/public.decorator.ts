import { SetMetadata } from '@nestjs/common';

export const ACCESS_PUBLIC = Symbol('ACCESS_PUBLIC');

export const Public = () => SetMetadata(ACCESS_PUBLIC, true);
