import { httpService } from '~/services/httpService';
import type { PaginatedResponse } from '~/types/api/property';
import type {
  InquiryItem,
  SubmitInquiryDto,
  SubmitInquiryResponse,
  RespondToInquiryDto,
  InquiryStatusUpdate,
  InquiryResponseUpdate,
  InquiryFilters,
} from '~/types/api/inquiry';

export const inquiryService = {
  submit: (propertyId: string, data: SubmitInquiryDto) =>
    httpService.post<SubmitInquiryResponse>(`/properties/${propertyId}/inquiries`, data),

  list: (filters?: InquiryFilters) =>
    httpService.get<PaginatedResponse<InquiryItem>>('/inquiries', { params: filters }),

  getMy: (filters?: InquiryFilters) =>
    httpService.get<PaginatedResponse<InquiryItem>>('/inquiries/my', { params: filters }),

  getById: (id: string) =>
    httpService.get<InquiryItem>(`/inquiries/${id}`),

  markAsRead: (id: string) =>
    httpService.patch<InquiryStatusUpdate>(`/inquiries/${id}/read`),

  respond: (id: string, data: RespondToInquiryDto) =>
    httpService.post<InquiryResponseUpdate>(`/inquiries/${id}/respond`, data),

  delete: (id: string) =>
    httpService.delete<void>(`/inquiries/${id}`),
};
