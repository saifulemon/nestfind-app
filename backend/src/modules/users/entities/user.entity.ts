import {
  Entity,
  Column,
  Index,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../core/base/base.entity';
import { RoleEnum } from '../../../common/enums/role.enum';
import { UserStatusEnum } from '../../../common/enums/user-status.enum';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { PropertyView } from '../../property-views/entities/property-view.entity';
import { SavedSearch } from '../../saved-searches/entities/saved-search.entity';
import { PropertyReview } from '../../reviews/entities/property-review.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { TourSlot } from '../../tours/entities/tour-slot.entity';
import { TourBooking } from '../../tours/entities/tour-booking.entity';
import { ChatConversation } from '../../chat/entities/chat-conversation.entity';
import { ChatMessage } from '../../chat/entities/chat-message.entity';
import { RentalApplication } from '../../applications/entities/rental-application.entity';

@Entity('users')
@Unique(['email'])
@Index(['role', 'status'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({
    type: 'varchar',
    default: RoleEnum.RENTER,
  })
  @Index()
  role: RoleEnum;

  @Column({
    type: 'varchar',
    enum: UserStatusEnum,
    default: UserStatusEnum.ACTIVE,
  })
  @Index()
  status: UserStatusEnum;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => PasswordResetToken, (resetToken) => resetToken.user)
  resetTokens: PasswordResetToken[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.user)
  inquiries: Inquiry[];

  @OneToMany(() => PropertyView, (propertyView) => propertyView.user)
  propertyViews: PropertyView[];

  @OneToMany(() => SavedSearch, (savedSearch) => savedSearch.user)
  savedSearches: SavedSearch[];

  @OneToMany(() => PropertyReview, (review) => review.user)
  reviews: PropertyReview[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => TourSlot, (slot) => slot.admin)
  tourSlots: TourSlot[];

  @OneToMany(() => TourBooking, (booking) => booking.user)
  tourBookings: TourBooking[];

  @OneToMany(() => ChatConversation, (conversation) => conversation.renter)
  conversationsAsRenter: ChatConversation[];

  @OneToMany(() => ChatConversation, (conversation) => conversation.admin)
  conversationsAsAdmin: ChatConversation[];

  @OneToMany(() => ChatMessage, (message) => message.sender)
  messages: ChatMessage[];

  @OneToMany(() => RentalApplication, (application) => application.applicant)
  applications: RentalApplication[];
}
