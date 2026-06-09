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
    const existing = await this.propertyViewRepository.findOne({
      where: { userId, propertyId } as any,
    });

    if (existing) {
      const updated = await this.propertyViewRepository.update(existing.id, {
        viewCount: existing.viewCount + 1,
        lastViewedAt: new Date(),
      });
      if (!updated) {
        throw new Error('Failed to update property view');
      }
      return updated;
    }

    return this.propertyViewRepository.create({
      userId,
      propertyId,
      viewCount: 1,
      lastViewedAt: new Date(),
    } as any);
  }

  async getRecentlyViewed(userId: string, limit: number = 20): Promise<PropertyView[]> {
    return this.propertyViewRepository.findRecentlyViewedByUser(userId, limit);
  }
}
