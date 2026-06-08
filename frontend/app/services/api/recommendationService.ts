import { httpService } from '~/services/httpService';
import type { PropertyListItem } from '~/types/api/property';

export interface Recommendation extends PropertyListItem {
  recommendationScore: number;
  matchReasons: string[];
}

export const recommendationService = {
  getRecommendations: (limit?: number) =>
    httpService.get<Recommendation[]>('/recommendations', {
      params: limit ? { limit } : undefined,
    }),
};
