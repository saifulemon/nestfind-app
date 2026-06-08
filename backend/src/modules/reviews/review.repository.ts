import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { PropertyReview } from './entities/property-review.entity';

@Injectable()
export class ReviewRepository extends BaseRepository<PropertyReview> {
  constructor(
    @InjectRepository(PropertyReview)
    repository: Repository<PropertyReview>,
  ) {
    super(repository);
  }

  async findByProperty(propertyId: string): Promise<PropertyReview[]> {
    return this.repository.find({
      where: { propertyId, status: 'approved' } as any,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPending(): Promise<PropertyReview[]> {
    return this.repository.find({
      where: { status: 'pending' } as any,
      relations: ['property', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(propertyId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.propertyId = :propertyId', { propertyId })
      .andWhere('review.status = :status', { status: 'approved' })
      .getRawOne();
    return result?.avg ? parseFloat(result.avg) : 0;
  }

  async incrementHelpful(id: string): Promise<void> {
    await this.repository.increment({ id } as any, 'helpfulCount', 1);
  }
}
