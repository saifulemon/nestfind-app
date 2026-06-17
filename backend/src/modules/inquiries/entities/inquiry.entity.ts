import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { InquiryStatusEnum } from '../../../common/enums/inquiry-status.enum';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('inquiries')
@Index(['propertyId'])
@Index(['userId'])
@Index(['status'])
@Index(['status', 'createdAt'])
export class Inquiry extends BaseEntity {
  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    enum: InquiryStatusEnum,
    default: InquiryStatusEnum.NEW,
  })
  status: InquiryStatusEnum;

  @Column({ type: 'text', nullable: true })
  response: string | null;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @ManyToOne(() => Property, (property) => property.inquiries, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.inquiries, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
