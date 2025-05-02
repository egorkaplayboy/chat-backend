import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { nameof } from '../utils/entity';

export enum ChatType {
  PERSONAL = 'personal',
  GROUP = 'group',
}

@Entity({ name: 'chat' })
@Index([nameof<ChatEntity>('id')])
export class ChatEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ enum: ChatType })
  type: ChatType;

  @Column({ type: 'bigint' })
  created_at: number;

  @Column({ type: 'text', nullable: true })
  name?: string;
}
