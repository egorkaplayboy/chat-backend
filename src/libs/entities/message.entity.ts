import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { nameof } from '../utils/entity';
import { UserEntity } from './user.entity';
import { ChatEntity } from './chat.entity';

@Entity({ name: 'message' })
@Index(
  [
    nameof<MessageEntity>('author_id'),
    nameof<MessageEntity>('chat_id'),
    nameof<MessageEntity>('sort_order'),
  ],
  { unique: true },
)
export class MessageEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  text?: string;

  @ManyToOne(() => UserEntity, (e) => e.id, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: nameof<MessageEntity>('author_id') })
  @Column('uuid')
  author_id: string;

  @ManyToOne(() => ChatEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<MessageEntity>('chat_id') })
  @Column('uuid')
  chat_id: string;

  @ManyToOne(() => MessageEntity, (e) => e.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: nameof<MessageEntity>('reply_id') })
  @Column('uuid', { nullable: true })
  reply_id?: string;

  @Column('bigint')
  sort_order: number;

  @Column('bigint')
  created_at: number;

  @Column('bigint', { nullable: true })
  updated_at?: number;

  @Column('text', { array: true, default: [] })
  attachments: string[];
}
