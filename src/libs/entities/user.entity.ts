import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { nameof } from '../utils/entity';
import { IsString } from 'class-validator';
import { StorageItemEntity } from './storage-item.entity';

export class UserDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  created_at: number;
}

@Entity({ name: 'users' })
@Index([nameof<UserEntity>('username')], { unique: true })
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text' })
  first_name: string;

  @Column({ type: 'text' })
  last_name: string;

  @Column({ type: 'bigint' })
  created_at: number;

  @OneToOne(() => StorageItemEntity, (e) => e.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: nameof<UserEntity>('avatar_id') })
  storage_item?: StorageItemEntity;

  @Column({ type: 'uuid', nullable: true })
  avatar_id?: string;

  @Column({ type: 'bigint', nullable: true })
  online?: number; // if null user online now, otherwise store timestamp when user been online
}
