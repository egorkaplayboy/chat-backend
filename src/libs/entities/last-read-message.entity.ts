import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { nameof } from '../utils/entity';
import { ChatEntity } from './chat.entity';
import { UserEntity } from './user.entity';
import { MessageEntity } from './message.entity';

@Entity({ name: 'last_read_message' })
@Index(
  [
    nameof<LastReadMessageEntity>('chat_id'),
    nameof<LastReadMessageEntity>('user_id'),
  ],
  { unique: true },
)
@Index([
  nameof<LastReadMessageEntity>('chat_id'),
  nameof<LastReadMessageEntity>('user_id'),
  nameof<LastReadMessageEntity>('message_id'),
])
export class LastReadMessageEntity {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => ChatEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<LastReadMessageEntity>('chat_id') })
  @Column('uuid')
  chat_id: string;

  @ManyToOne(() => UserEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<LastReadMessageEntity>('user_id') })
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => MessageEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<LastReadMessageEntity>('message_id') })
  @Column('uuid')
  message_id: string;
}
