import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindOneDto {
  @IsString()
  username: string;
}
