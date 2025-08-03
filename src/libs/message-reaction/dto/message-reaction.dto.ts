import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';
import { MessageIdDto } from 'src/libs/message/dto/mesaage.dto';

export class MessageReactionInsertDto extends MessageIdDto {
  @ApiProperty({ type: String })
  @IsString()
  @Type(() => String)
  value: string;
}

export class MessageReactionIdDto {
  @ApiProperty({ type: String })
  @IsUUID(4)
  @Type(() => String)
  message_reaction_id: string;
}
