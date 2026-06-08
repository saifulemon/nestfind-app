import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { PropertyView } from './entities/property-view.entity';

@Injectable()
export class PropertyViewRepository extends BaseRepository<PropertyView> {
  constructor(
    @InjectRepository(PropertyView)
    repository: Repository<PropertyView>,
  ) {
    super(repository);
  }

  async findByUserAndProperty(userId: string, propertyId: string): Promise<PropertyView | null> {
    return this.findOne({
      where: { userId, propertyId } as any,
    });
  }

  async findRecentlyViewedByUser(userId: string, limit: number = 20): Promise<PropertyView[]> {
    return this.repository.find({
      where: { userId } as any,
      order: { lastViewedAt: 'DESC' },
      take: limit,
      relations: ['property', 'property.photos'],
    });
  }

  async incrementViewCount(userId: string, propertyId: string): Promise<void> {
    await this.repository.increment(
      { userId, propertyId } as any,
      'viewCount',
      1,
    );
    await this.repository.update(
      { userId, propertyId } as any,
      { lastViewedAt: new Date() },
    );
  }
}
