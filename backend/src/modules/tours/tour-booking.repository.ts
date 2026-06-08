import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { TourBooking } from './entities/tour-booking.entity';

@Injectable()
export class TourBookingRepository extends BaseRepository<TourBooking> {
  constructor(
    @InjectRepository(TourBooking)
    repository: Repository<TourBooking>,
  ) {
    super(repository);
  }

  async findByUser(userId: string): Promise<TourBooking[]> {
    return this.repository.find({
      where: { userId } as any,
      relations: ['property', 'property.photos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProperty(propertyId: string): Promise<TourBooking[]> {
    return this.repository.find({
      where: { propertyId } as any,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
