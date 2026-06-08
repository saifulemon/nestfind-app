import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { InquiryRepository } from './inquiry.repository';
import { PropertyRepository } from '../properties/property.repository';
import { UserRepository } from '../users/user.repository';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { InquirySubmitController } from './inquiry-submit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, Property, User])],
  controllers: [InquiryController, InquirySubmitController],
  providers: [InquiryRepository, PropertyRepository, UserRepository, InquiryService],
  exports: [InquiryService],
})
export class InquiryModule {}
