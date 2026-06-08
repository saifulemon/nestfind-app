import { httpService } from '~/services/httpService';
import type { AmenityDto } from '~/types/api/property';

export interface CreateAmenityDto {
  name: string;
  icon: string;
}

export interface UpdateAmenityDto {
  name?: string;
  icon?: string;
}

export const amenityService = {
  list: () =>
    httpService.get<AmenityDto[]>('/amenities'),

  create: (data: CreateAmenityDto) =>
    httpService.post<AmenityDto>('/amenities', data),

  update: (id: string, data: UpdateAmenityDto) =>
    httpService.patch<AmenityDto>(`/amenities/${id}`, data),

  delete: (id: string) =>
    httpService.delete<void>(`/amenities/${id}`),
};
