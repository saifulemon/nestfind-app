import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { ReviewRepository } from './review.repository';
import { NotificationService } from '../notifications/notification.service';
import { PropertyReview } from './entities/property-review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService extends BaseService<PropertyReview> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly notificationService: NotificationService,
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
    const review = await this.findByIdOrFail(reviewId);
    if (review.status !== 'pending') {
      throw new BadRequestException('Review can only be moderated from pending status');
    }
    const updated = await this.reviewRepository.update(reviewId, { status: 'approved' });

    await this.notificationService.createNotification({
      userId: review.userId,
      type: 'review_approved',
      title: 'Review approved',
      message: 'Your review has been approved and is now visible.',
      data: { reviewId, propertyId: review.propertyId },
    });

    return updated;
  }

  async rejectReview(reviewId: string): Promise<PropertyReview | null> {
    const review = await this.findByIdOrFail(reviewId);
    if (review.status !== 'pending') {
      throw new BadRequestException('Review can only be moderated from pending status');
    }
    const updated = await this.reviewRepository.update(reviewId, { status: 'rejected' });

    await this.notificationService.createNotification({
      userId: review.userId,
      type: 'review_rejected',
      title: 'Review rejected',
      message: 'Your review did not meet our guidelines and has been rejected.',
      data: { reviewId, propertyId: review.propertyId },
    });

    return updated;
  }
}
