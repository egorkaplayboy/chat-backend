import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { nameof } from '../utils/entity';

@Entity({ name: 'storage_item' })
@Index([nameof<StorageItemEntity>('id')])
export class StorageItemEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  originalname: string;

  @Column({ type: 'text' })
  mimetype: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'text', nullable: true })
  filename?: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text', nullable: true })
  thumbnail_path?: string;
}
