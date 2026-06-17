import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('property_views')
@Index(['userId'])
@Index(['propertyId'])
@Index(['lastViewedAt'])
export class PropertyView extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ name: 'view_count', type: 'integer', default: 1 })
  viewCount: number;

  @Column({ name: 'last_viewed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastViewedAt: Date;

  @ManyToOne(() => User, (user) => user.propertyViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Property, (property) => property.propertyViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
