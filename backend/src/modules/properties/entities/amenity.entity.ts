import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { PropertyAmenity } from './property-amenity.entity';

@Entity('amenities')
export class Amenity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @OneToMany(() => PropertyAmenity, (pa) => pa.amenity)
  propertyAmenities: PropertyAmenity[];
}
