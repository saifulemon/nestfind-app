import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { ReviewRepository } from './review.repository';
import { PropertyReview } from './entities/property-review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService extends BaseService<PropertyReview> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
  ) {
    super(reviewRepository, 'PropertyReview');
  }

  async createReview(userId: string, propertyId: string, dto: CreateReviewDto): Promise<PropertyReview> {
    return this.reviewRepository.create({
      userId,
      propertyId,
      rating: dto.rating,
      title: dto.title || null,
      comment: dto.comment,
      status: 'approved',
      isVerified: false,
      helpfulCount: 0,
    });
  }

  async getPropertyReviews(propertyId: string): Promise<{
    reviews: PropertyReview[];
    averageRating: number;
    totalCount: number;
  }> {
    const reviews = await this.reviewRepository.findByProperty(propertyId);
    const averageRating = await this.reviewRepository.getAverageRating(propertyId);
    const totalCount = reviews.length;
    return { reviews, averageRating, totalCount };
  }

  async markHelpful(reviewId: string): Promise<void> {
    await this.reviewRepository.incrementHelpful(reviewId);
  }

  async getPendingReviews(): Promise<PropertyReview[]> {
    return this.reviewRepository.findPending();
  }

  async approveReview(reviewId: string): Promise<PropertyReview | null> {
    return this.reviewRepository.update(reviewId, { status: 'approved' });
  }

  async rejectReview(reviewId: string): Promise<PropertyReview | null> {
    return this.reviewRepository.update(reviewId, { status: 'rejected' });
  }
}
