import { httpService } from '~/services/httpService';

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchText: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  propertyType: string | null;
  city: string | null;
  alertEnabled: boolean;
  lastAlertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchData {
  name: string;
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  city?: string;
  alertEnabled?: boolean;
}

export const savedSearchService = {
  list: () =>
    httpService.get<SavedSearch[]>('/saved-searches'),

  create: (data: CreateSavedSearchData) =>
    httpService.post<SavedSearch>('/saved-searches', data),

  toggleAlerts: (id: string, enabled: boolean) =>
    httpService.patch<SavedSearch>(`/saved-searches/${id}/alerts`, { enabled }),

  delete: (id: string) =>
    httpService.delete<void>(`/saved-searches/${id}`),
};
