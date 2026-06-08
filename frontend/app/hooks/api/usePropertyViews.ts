import { useState, useEffect } from 'react';
import { propertyViewService } from '~/services/api/propertyViewService';
import type { PropertyView } from '~/types/api/property-view';

export function useTrackPropertyView() {
  const track = async (propertyId: string) => {
    try {
      await propertyViewService.trackView(propertyId);
    } catch {
      // Silently fail - view tracking is non-critical
    }
  };
  return { track };
}

export function useRecentlyViewed(limit: number = 8) {
  const [data, setData] = useState<PropertyView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    propertyViewService
      .getRecentlyViewed(limit)
      .then((views) => {
        const arr = Array.isArray(views) ? views : [];
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
