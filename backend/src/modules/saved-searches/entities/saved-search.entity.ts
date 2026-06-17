import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('saved_searches')
@Index(['userId'])
export class SavedSearch extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'search_text', type: 'varchar', length: 200, nullable: true })
  searchText: string | null;

  @Column({ name: 'min_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPrice: number | null;

  @Column({ name: 'max_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxPrice: number | null;

  @Column({ type: 'integer', nullable: true })
  bedrooms: number | null;

  @Column({ name: 'property_type', type: 'varchar', length: 50, nullable: true })
  propertyType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'alert_enabled', type: 'boolean', default: true })
  alertEnabled: boolean;

  @Column({ name: 'last_alerted_at', type: 'timestamp', nullable: true })
  lastAlertedAt: Date | null;

  @ManyToOne(() => User, (user) => user.savedSearches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
