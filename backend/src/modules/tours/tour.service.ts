import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { TourSlotRepository } from './tour-slot.repository';
import { TourBookingRepository } from './tour-booking.repository';
import { TourSlot } from './entities/tour-slot.entity';
import { TourBooking } from './entities/tour-booking.entity';

@Injectable()
export class TourService {
  constructor(
    private readonly slotRepository: TourSlotRepository,
    private readonly bookingRepository: TourBookingRepository,
  ) {}

  async getAvailableSlots(propertyId: string): Promise<TourSlot[]> {
    return this.slotRepository.findAvailableByProperty(propertyId);
  }

  async createSlot(adminId: string, data: {
    propertyId: string;
    startTime: Date;
    endTime: Date;
    tourType: string;
  }): Promise<TourSlot> {
    return this.slotRepository.create({
      adminId,
      propertyId: data.propertyId,
      startTime: data.startTime,
      endTime: data.endTime,
      tourType: data.tourType,
      isBooked: false,
    });
  }

  async bookSlot(userId: string, slotId: string, notes?: string): Promise<TourBooking> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    if (slot.isBooked) {
      throw new ConflictException('Slot already booked');
    }

    await this.slotRepository.update(slotId, { isBooked: true });

    return this.bookingRepository.create({
      slotId,
      userId,
      propertyId: slot.propertyId,
      notes: notes || null,
      status: 'confirmed',
    });
  }

  async getMyBookings(userId: string): Promise<TourBooking[]> {
    return this.bookingRepository.findByUser(userId);
  }

  async cancelBooking(userId: string, bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    await this.bookingRepository.update(bookingId, { status: 'cancelled' });
    await this.slotRepository.update(booking.slotId, { isBooked: false });
  }

  async getPropertyBookings(propertyId: string): Promise<TourBooking[]> {
    return this.bookingRepository.findByProperty(propertyId);
  }

  async deleteSlot(slotId: string): Promise<void> {
    await this.slotRepository.delete(slotId);
  }
}
