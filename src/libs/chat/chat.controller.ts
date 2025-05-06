import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from '../decorators/user.decorator';
import { UserDto } from '../entities/user.entity';
import { CreateChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  async create(@User() user: UserDto, @Body() dto: CreateChatDto) {
    return this.chatService.createChat(dto, user);
  }
}
