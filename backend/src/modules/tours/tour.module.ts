import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourSlot } from './entities/tour-slot.entity';
import { TourBooking } from './entities/tour-booking.entity';
import { TourSlotRepository } from './tour-slot.repository';
import { TourBookingRepository } from './tour-booking.repository';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TourSlot, TourBooking])],
  controllers: [TourController],
  providers: [TourSlotRepository, TourBookingRepository, TourService],
  exports: [TourService],
})
export class TourModule {}
