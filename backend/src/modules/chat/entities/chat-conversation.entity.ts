import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_conversations')
@Index(['renterId'])
@Index(['adminId'])
export class ChatConversation extends BaseEntity {
  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @Column({ name: 'renter_id', type: 'uuid' })
  renterId: string;

  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subject: string | null;

  @ManyToOne(() => Property, (property) => property.conversations, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.conversationsAsRenter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'renter_id' })
  renter: User;

  @ManyToOne(() => User, (user) => user.conversationsAsAdmin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: User;
}
