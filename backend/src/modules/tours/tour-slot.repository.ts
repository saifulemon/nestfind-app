import { Injectable } from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { TourSlot } from './entities/tour-slot.entity';

@Injectable()
export class TourSlotRepository extends BaseRepository<TourSlot> {
  constructor(
    @InjectRepository(TourSlot)
    repository: Repository<TourSlot>,
  ) {
    super(repository);
  }

  async findAvailableByProperty(propertyId: string): Promise<TourSlot[]> {
    return this.repository.find({
      where: {
        propertyId,
        isBooked: false,
        startTime: MoreThan(new Date()),
      } as any,
      order: { startTime: 'ASC' },
    });
  }

  async findByProperty(propertyId: string): Promise<TourSlot[]> {
    return this.repository.find({
      where: { propertyId } as any,
      order: { startTime: 'ASC' },
    });
  }
}
