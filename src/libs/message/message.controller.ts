import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../decorators/user.decorator';
import { UserDto } from '../entities/user.entity';
import {
  CreateMessageDto,
  GetMessagesQuery,
  GetMessagesResponse,
} from './dto/mesaage.dto';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AppClient } from 'src/app-client/app-client';

@Controller('message')
export class MessageController {
  constructor(
    @Inject(forwardRef(() => AppClient)) private readonly appClient: AppClient,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateMessageDto })
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  async create(
    @User() user: UserDto,
    @Body() dto: CreateMessageDto,
    @UploadedFiles() attachments?: Express.Multer.File[],
  ) {
    return this.appClient.rpc(
      'message',
      'createMessage',
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

  @Get()
  @ApiResponse({ type: GetMessagesResponse, isArray: true })
  async get(@User() user: UserDto, @Query() query: GetMessagesQuery) {
    const limit = Number(query.limit) || 20;
    const offset = Number(query.offset) || 0;

    return this.appClient.rpc('message', 'getMessages', user, {
      chat_id: query.chat_id,
      limit,
      offset,
    });
  }
}
