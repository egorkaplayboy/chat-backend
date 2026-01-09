import { Module } from '@nestjs/common';
import { MessageReactionController } from './message-reaction.controller';
import { MessageReactionService } from './message-reaction.service';

@Module({
  controllers: [MessageReactionController],
  providers: [MessageReactionService],
  exports: [MessageReactionService],
})
export class MessageReactionModule {}
