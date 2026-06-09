import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { PropertyTypeEnum } from '../../../common/enums/property-type.enum';
import { PropertyPhoto } from './property-photo.entity';
import { PropertyAmenity } from './property-amenity.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { PropertyView } from '../../property-views/entities/property-view.entity';
import { PropertyReview } from '../../reviews/entities/property-review.entity';
import { TourSlot } from '../../tours/entities/tour-slot.entity';
import { TourBooking } from '../../tours/entities/tour-booking.entity';
import { ChatConversation } from '../../chat/entities/chat-conversation.entity';
import { RentalApplication } from '../../applications/entities/rental-application.entity';

@Entity('properties')
@Index(['propertyType'])
@Index(['price'])
@Index(['bedrooms'])
@Index(['bathrooms'])
@Index(['addressCity'])
@Index(['addressState'])
@Index(['addressLatitude', 'addressLongitude'])
export class Property extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  bedrooms: number;

  @Column({ type: 'integer' })
  bathrooms: number;

  @Column({ name: 'square_feet', type: 'integer', nullable: true })
  squareFeet: number | null;

  @Column({
    name: 'property_type',
    type: 'varchar',
    enum: PropertyTypeEnum,
  })
  propertyType: PropertyTypeEnum;

  @Column({ name: 'address_street', type: 'varchar', length: 200 })
  addressStreet: string;

  @Column({ name: 'address_city', type: 'varchar', length: 100 })
  addressCity: string;

  @Column({ name: 'address_state', type: 'varchar', length: 100 })
  addressState: string;

  @Column({ name: 'address_zip_code', type: 'varchar', length: 10 })
  addressZipCode: string;

  @Column({ name: 'address_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  addressLatitude: number | null;

  @Column({ name: 'address_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  addressLongitude: number | null;

  @Column({ name: 'available_from', type: 'date', nullable: true })
  availableFrom: string | null;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string | null;

  @OneToMany(() => PropertyPhoto, (photo) => photo.property)
  photos: PropertyPhoto[];

  @OneToMany(() => PropertyAmenity, (pa) => pa.property)
  propertyAmenities: PropertyAmenity[];

  @OneToMany(() => Favorite, (favorite) => favorite.property)
  favorites: Favorite[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.property)
  inquiries: Inquiry[];

  @OneToMany(() => PropertyView, (propertyView) => propertyView.property)
  propertyViews: PropertyView[];

  @OneToMany(() => PropertyReview, (review) => review.property)
  reviews: PropertyReview[];

  @OneToMany(() => TourSlot, (slot) => slot.property)
  tourSlots: TourSlot[];

  @OneToMany(() => TourBooking, (booking) => booking.property)
  tourBookings: TourBooking[];

  @OneToMany(() => ChatConversation, (conversation) => conversation.property)
  conversations: ChatConversation[];

  @OneToMany(() => RentalApplication, (application) => application.property)
  applications: RentalApplication[];
}
