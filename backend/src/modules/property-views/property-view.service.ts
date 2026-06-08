import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { PropertyViewRepository } from './property-view.repository';
import { PropertyView } from './entities/property-view.entity';

@Injectable()
export class PropertyViewService extends BaseService<PropertyView> {
  constructor(
    private readonly propertyViewRepository: PropertyViewRepository,
  ) {
    super(propertyViewRepository, 'PropertyView');
  }

  async trackView(userId: string, propertyId: string): Promise<PropertyView> {
    const existing = await this.propertyViewRepository.findByUserAndProperty(userId, propertyId);

    if (existing) {
      await this.propertyViewRepository.incrementViewCount(userId, propertyId);
      // Return the updated record
      return this.propertyViewRepository.findByUserAndProperty(userId, propertyId) as Promise<PropertyView>;
    }

    return this.propertyViewRepository.create({
      userId,
      propertyId,
      viewCount: 1,
      lastViewedAt: new Date(),
    });
  }

  async getRecentlyViewed(userId: string, limit: number = 20): Promise<PropertyView[]> {
    return this.propertyViewRepository.findRecentlyViewedByUser(userId, limit);
  }
}
