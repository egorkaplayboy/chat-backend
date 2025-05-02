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

@Entity({ name: 'chat_members' })
@Index([nameof<ChatMember>('user_id'), nameof<ChatMember>('chat_id')], {
  unique: true,
})
export class ChatMember {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ManyToOne(() => UserEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<ChatMember>('user_id') })
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => ChatEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<ChatMember>('chat_id') })
  @Column('uuid')
  chat_id: string;

  @Column('bigint')
  created_at: number;
}
