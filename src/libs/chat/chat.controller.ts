import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { User } from '../decorators/user.decorator';
import { UserDto } from '../entities/user.entity';
import {
  ChatIdDto,
  ChatSettingActionDto,
  CreateChatDto,
  GetChatQuery,
  GetChatResponse,
} from './dto/chat.dto';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppClient } from 'src/app-client/app-client';

@Controller('chat')
@ApiTags('Chat')
export class ChatController {
  constructor(
    @Inject(forwardRef(() => AppClient)) private readonly appClient: AppClient,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({ type: String })
  async createChat(@User() user: UserDto, @Body() dto: CreateChatDto) {
    return this.appClient.rpc('chat', 'createChat', dto, user);
  }

  @Get()
  @ApiResponse({ type: GetChatResponse, isArray: true })
  async getChats(@User() user: UserDto, @Query() query: GetChatQuery) {
    const limit = Number(query.limit) || 20;
    const offset = Number(query.offset) || 0;

    return this.appClient.rpc('chat', 'getChats', user, { limit, offset });
  }

  @Delete('/:chat_id')
  @ApiNoContentResponse()
  async deleteChat(@Param() dto: ChatIdDto) {
    return this.appClient.rpc('chat', 'deleteChat', dto);
  }

  @Patch('update-setting')
  @ApiNoContentResponse()
  @ApiBody({ type: ChatSettingActionDto })
  async chatSettingAction(
    @User() user: UserDto,
    @Body() body: ChatSettingActionDto,
  ) {
    return this.appClient.rpc('chat', 'chatSettingAction', user, body);
  }
}
