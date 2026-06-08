import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tour_bookings')
@Index(['userId'])
@Index(['propertyId'])
export class TourBooking extends BaseEntity {
  @Column({ name: 'slot_id', type: 'uuid' })
  slotId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 50, default: 'confirmed' })
  status: string;

  @ManyToOne(() => Property, (property) => property.tourBookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.tourBookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
