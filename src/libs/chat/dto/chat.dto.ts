import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChatType } from 'src/libs/entities/chat.entity';

export class CreateChatDto {
  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  member_ids: string[];

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  name?: string;
}

export class GetChatQuery {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class GetChatResponse {
  @ApiProperty({ type: String })
  @IsString()
  id: string;

  @ApiProperty({ enum: ChatType })
  @IsEnum(ChatType)
  type: ChatType;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  last_read_message?: {
    text?: string;
    attachments?: string[];
    created_at: number;
    user: { id: string; username: string; avatar?: string };
  };
}

export class ChatIdDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID(4)
  @Type(() => String)
  chat_id: string;
}

export class ChatSettingActionDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID(4)
  @Type(() => String)
  chat_id: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  notify?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  pinned?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  blocked?: boolean;
}
