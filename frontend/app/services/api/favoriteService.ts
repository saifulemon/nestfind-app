import { httpService } from '~/services/httpService';
import type { PaginatedResponse } from '~/types/api/property';
import type {
  FavoriteItem,
  AddFavoriteResponse,
  AddFavoriteDto,
} from '~/types/api/favorite';

export const favoriteService = {
  list: (params?: { page?: number; limit?: number }) =>
    httpService.get<PaginatedResponse<FavoriteItem>>('/favorites', { params }),

  add: (data: AddFavoriteDto) =>
    httpService.post<AddFavoriteResponse>('/favorites', data),

  remove: (propertyId: string) =>
    httpService.delete<void>(`/favorites/${propertyId}`),
};
