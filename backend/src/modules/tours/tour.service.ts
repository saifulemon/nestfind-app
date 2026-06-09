import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { TourSlotRepository } from './tour-slot.repository';
import { TourBookingRepository } from './tour-booking.repository';
import { NotificationService } from '../notifications/notification.service';
import { TourSlot } from './entities/tour-slot.entity';
import { TourBooking } from './entities/tour-booking.entity';

@Injectable()
export class TourService {
  constructor(
    private readonly slotRepository: TourSlotRepository,
    private readonly bookingRepository: TourBookingRepository,
    private readonly notificationService: NotificationService,
    @InjectDataSource() private readonly dataSource: DataSource,
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
    if (data.endTime <= data.startTime) {
      throw new BadRequestException('End time must be after start time');
    }
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
    const booking = await this.dataSource.transaction(async (manager) => {
      const slotRepo = manager.getRepository(TourSlot);
      const bookingRepo = manager.getRepository(TourBooking);
      const slot = await slotRepo.findOne({
        where: { id: slotId },
      });
      if (!slot) {
        throw new NotFoundException('Slot not found');
      }
      if (slot.isBooked) {
        throw new ConflictException('Slot already booked');
      }
      await slotRepo.update(slotId, { isBooked: true });
      return bookingRepo.save(bookingRepo.create({
        slotId,
        userId,
        propertyId: slot.propertyId,
        notes: notes || null,
        status: 'confirmed',
      }));
    });

    await this.notificationService.createNotification({
      userId,
      type: 'tour_reminder',
      title: 'Tour booked successfully',
      message: `Your tour has been confirmed. Check "My Tours" for details.`,
      data: { bookingId: booking.id, slotId, propertyId: booking.propertyId },
    });

    return booking;
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

  async deleteSlot(adminId: string, slotId: string): Promise<void> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot || slot.adminId !== adminId) {
      throw new NotFoundException('Slot not found');
    }
    await this.slotRepository.delete(slotId);
  }
}
