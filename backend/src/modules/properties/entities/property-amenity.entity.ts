import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from './property.entity';
import { Amenity } from './amenity.entity';

@Entity('property_amenities')
@Index(['amenityId'])
@Index(['propertyId'])
export class PropertyAmenity {
  @PrimaryColumn({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @PrimaryColumn({ name: 'amenity_id', type: 'uuid' })
  amenityId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => Amenity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;
}
