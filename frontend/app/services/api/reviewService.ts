import { httpService } from '~/services/httpService';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  user?: {
    name: string;
  };
}

export interface ReviewSummary {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
}

export const reviewService = {
  getPropertyReviews: (propertyId: string) =>
    httpService.get<ReviewSummary>(`/properties/${propertyId}/reviews`),

  submitReview: (propertyId: string, data: { rating: number; title?: string; comment: string }) =>
    httpService.post<Review>(`/properties/${propertyId}/reviews`, data),

  markHelpful: (reviewId: string) =>
    httpService.patch<void>(`/reviews/${reviewId}/helpful`),
};
