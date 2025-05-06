import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  member_ids: string[];

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  name?: string;
}
