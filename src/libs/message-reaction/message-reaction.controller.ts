import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { MessageReactionService } from './message-reaction.service';
import { ApiBody, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import {
  MessageReactionIdDto,
  MessageReactionInsertDto,
} from './dto/message-reaction.dto';
import { User } from '../decorators/user.decorator';
import { UserDto } from '../entities/user.entity';

@Controller('message-reaction')
@ApiTags('MessageReaction')
export class MessageReactionController {
  constructor(
    private readonly messageReactionService: MessageReactionService,
  ) {}

  @Post('add-reaction')
  @ApiBody({ type: MessageReactionInsertDto })
  @ApiNoContentResponse()
  addReaction(@User() user: UserDto, @Body() dto: MessageReactionInsertDto) {
    return this.messageReactionService.insertReaction(user, dto);
  }

  @Delete('/:message_reaction_id')
  @ApiNoContentResponse()
  deleteReaction(@Param() dto: MessageReactionIdDto) {
    return this.messageReactionService.deleteReaction(dto);
  }
}
