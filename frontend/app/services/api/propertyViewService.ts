import { httpService } from '~/services/httpService';
import type { PropertyView } from '~/types/api/property-view';

export const propertyViewService = {
  trackView: (propertyId: string) =>
    httpService.post<PropertyView>(`/property-views/${propertyId}`),

  getRecentlyViewed: (limit?: number) =>
    httpService.get<PropertyView[]>(`/property-views/recently-viewed`, {
      params: limit ? { limit } : undefined,
    }),
};
