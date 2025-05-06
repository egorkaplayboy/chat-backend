import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { nameof } from '../utils/entity';
import { ChatEntity } from './chat.entity';

@Entity({ name: 'chat_user_setting' })
@Index(
  [
    nameof<ChatUserSettingEntity>('chat_id'),
    nameof<ChatUserSettingEntity>('user_id'),
  ],
  { unique: true },
)
export class ChatUserSettingEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ManyToOne(() => UserEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<ChatUserSettingEntity>('user_id') })
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => ChatEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<ChatUserSettingEntity>('chat_id') })
  @Column('uuid')
  chat_id: string;

  @Column({ type: Boolean, default: true })
  notify: boolean;

  @Column({ type: Boolean, default: false })
  pinned: boolean;

  @Column({ type: Boolean, default: false })
  archived: boolean;

  @Column({ type: Boolean, default: false })
  blocked: boolean;

  @Column('bigint')
  created_at: number;
}
