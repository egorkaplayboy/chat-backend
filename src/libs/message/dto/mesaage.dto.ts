import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMessageDto {
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  chat_id?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  recipient_id?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  reply_id?: string;

  @ApiPropertyOptional({ type: String, format: 'binary' })
  attachments?: Express.Multer.File[];
}

export class GetMessagesQuery {
  @ApiPropertyOptional({ type: Number })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ type: Number })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiProperty({ type: String })
  @IsString()
  @Type(() => String)
  chat_id: string;
}

export class GetMessagesResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsString()
  @Type(() => String)
  id: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  @Type(() => String)
  text?: string;

  attachments?: string[];

  @ApiProperty({ type: Number, format: 'timestamp' })
  @IsInt()
  @Type(() => Number)
  created_at: number;

  @ApiProperty({ type: Number, format: 'timestamp' })
  @IsInt()
  @Type(() => Number)
  updated_at: number;
  author: { id: string; username: string; avatar?: string };
  reply?: { id: string; text?: string; created_at: number; updated_at: number };

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @Type(() => Boolean)
  is_mine: boolean;
}

export class MessageIdDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID(4)
  @Type(() => String)
  message_id: string;
}
