import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { User } from '../users/entities/user.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { UserRepository } from '../users/user.repository';
import { PropertyRepository } from '../properties/property.repository';
import { InquiryRepository } from '../inquiries/inquiry.repository';
import { FavoriteRepository } from '../favorites/favorite.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Inquiry, User, Favorite])],
  controllers: [AdminController],
  providers: [
    UserRepository,
    PropertyRepository,
    InquiryRepository,
    FavoriteRepository,
    AdminService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
