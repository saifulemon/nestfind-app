import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('rental_applications')
@Index(['applicantId'])
@Index(['propertyId'])
@Index(['status'])
export class RentalApplication extends BaseEntity {
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string;

  @Column({ type: 'varchar', length: 50, default: 'submitted' })
  status: string;

  @Column({ name: 'monthly_income', type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyIncome: number | null;

  @Column({ name: 'employment_status', type: 'varchar', length: 50, nullable: true })
  employmentStatus: string | null;

  @Column({ name: 'employer_name', type: 'varchar', length: 200, nullable: true })
  employerName: string | null;

  @Column({ name: 'employer_phone', type: 'varchar', length: 20, nullable: true })
  employerPhone: string | null;

  @Column({ name: 'move_in_date', type: 'date', nullable: true })
  moveInDate: string | null;

  @Column({ name: 'has_pets', type: 'boolean', default: false })
  hasPets: boolean;

  @Column({ name: 'pet_details', type: 'text', nullable: true })
  petDetails: string | null;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes: string | null;

  @ManyToOne(() => Property, (property) => property.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;
}
