import { Module } from '@nestjs/common';
import { MessageReactionController } from './message-reaction.controller';
import { MessageReactionService } from './message-reaction.service';

@Module({
  controllers: [MessageReactionController],
  providers: [MessageReactionService],
})
export class MessageReactionModule {}
