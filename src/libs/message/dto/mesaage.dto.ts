import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
