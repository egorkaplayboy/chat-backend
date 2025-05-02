import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';
import { nameof } from '../utils/entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'message_reaction' })
@Index([
  nameof<MessageReactionEntity>('message_id'),
  nameof<MessageReactionEntity>('author_id'),
  nameof<MessageReactionEntity>('value'),
])
export class MessageReactionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => MessageEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<MessageReactionEntity>('message_id') })
  @Column('uuid')
  message_id: string;

  @ManyToOne(() => UserEntity, (e) => e.id, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: nameof<MessageReactionEntity>('author_id') })
  @Column('uuid')
  author_id: string;

  @Column('text')
  value: string;
}
