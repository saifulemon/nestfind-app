import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tour_slots')
@Index(['propertyId'])
@Index(['startTime'])
@Index(['adminId'])
export class TourSlot extends BaseEntity {
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ name: 'tour_type', type: 'varchar', length: 50, default: 'in_person' })
  tourType: string;

  @Column({ name: 'is_booked', type: 'boolean', default: false })
  isBooked: boolean;

  @ManyToOne(() => Property, (property) => property.tourSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.tourSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: User;
}
