import { httpService } from '~/services/httpService';
import type {
  PropertyListItem,
  PropertyDetail,
  PropertySearchParams,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyPhoto,
  PaginatedResponse,
} from '~/types/api/property';

export const propertyService = {
  search: (params?: PropertySearchParams) =>
    httpService.get<PaginatedResponse<PropertyListItem>>('/properties', { params }),

  getById: (id: string) =>
    httpService.get<PropertyDetail>(`/properties/${id}`),

  create: (data: CreatePropertyDto) =>
    httpService.post<PropertyDetail>('/properties', data),

  update: (id: string, data: UpdatePropertyDto) =>
    httpService.patch<PropertyDetail>(`/properties/${id}`, data),

  delete: (id: string) =>
    httpService.delete<void>(`/properties/${id}`),

  uploadPhotos: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return httpService.post<PropertyPhoto[]>(`/properties/${id}/photos`, formData);
  },

  deletePhoto: (propertyId: string, photoId: string) =>
    httpService.delete<void>(`/properties/${propertyId}/photos/${photoId}`),

  setPrimaryPhoto: (propertyId: string, photoId: string) =>
    httpService.patch<PropertyPhoto>(`/properties/${propertyId}/photos/${photoId}/primary`),

  reorderPhotos: (propertyId: string, photoIds: string[]) =>
    httpService.patch<PropertyPhoto[]>(`/properties/${propertyId}/photos/reorder`, { photoIds }),
};
