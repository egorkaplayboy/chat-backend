import { randomUUID } from 'crypto';
import { BaseService } from '../base/base.service';
import { MessageReactionEntity } from '../entities/message-reaction.entity';
import { UserDto } from '../entities/user.entity';
import {
  MessageReactionIdDto,
  MessageReactionInsertDto,
} from './dto/message-reaction.dto';
import { nameof } from '../utils/entity';
import { Service } from '../decorators/service.decorator';

@Service('messageReaction')
export class MessageReactionService extends BaseService {
  async insertReaction(user: UserDto, dto: MessageReactionInsertDto) {
    if (dto.value.trim() === '') return;

    const reaction = this.manager.create(MessageReactionEntity, {
      id: randomUUID(),
      author_id: user.id,
      message_id: dto.message_id,
      value: dto.value,
    } satisfies MessageReactionEntity);
    await this.manager.insert(MessageReactionEntity, reaction);
  }

  async deleteReaction(dto: MessageReactionIdDto) {
    await this.manager.delete(MessageReactionEntity, {
      [nameof<MessageReactionEntity>('id')]: dto.message_reaction_id,
    });
  }
}
