import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { User } from '../decorators/user.decorator';
import { UserDto } from '../entities/user.entity';
import { CreateMessageDto } from './dto/mesaage.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('create')
  @ApiBody({ type: CreateMessageDto })
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  async create(
    @User() user: UserDto,
    @Body() dto: CreateMessageDto,
    @UploadedFiles() attachments?: Express.Multer.File[],
  ) {
    return this.messageService.createMessage(
      {
        attachments,
        chat_id: dto.chat_id,
        reply_id: dto.reply_id,
        text: dto.text,
        recipient_id: dto.recipient_id,
      },
      user,
    );
  }
}
