import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '~/services/api/reviewService';
import type { ReviewSummary } from '~/services/api/reviewService';

export function usePropertyReviews(propertyId: string | undefined) {
  const [data, setData] = useState<ReviewSummary>({ reviews: [], averageRating: 0, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const refetch = useCallback(() => {
    if (!propertyId) return;
    setIsLoading(true);
    setIsError(false);
    reviewService
      .getPropertyReviews(propertyId)
      .then((summary) => {
        setData(summary || { reviews: [], averageRating: 0, totalCount: 0 });
      })
      .catch(() => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const submitReview = useCallback(async (reviewData: { rating: number; title?: string; comment: string }) => {
    if (!propertyId) return;
    await reviewService.submitReview(propertyId, reviewData);
    refetch();
  }, [propertyId, refetch]);

  const markHelpful = useCallback(async (reviewId: string) => {
    await reviewService.markHelpful(reviewId);
    setData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      ),
    }));
  }, []);

  return { data, isLoading, isError, submitReview, markHelpful };
}
