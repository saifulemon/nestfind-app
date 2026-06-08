import { useState, useEffect } from 'react';
import { recommendationService } from '~/services/api/recommendationService';
import type { Recommendation } from '~/services/api/recommendationService';

export function useRecommendations(limit: number = 12) {
  const [data, setData] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    recommendationService
      .getRecommendations(limit)
      .then((recommendations) => {
        const arr = Array.isArray(recommendations) ? recommendations : [];
        setData(arr);
      })
      .catch(() => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [limit]);

  return { data, isLoading, isError };
}
