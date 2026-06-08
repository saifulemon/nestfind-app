export type InquiryStatus = 'new' | 'read' | 'responded';

export interface InquiryItem {
  id: string;
  property: {
    id: string;
    title: string;
  };
  renter: {
    id: string;
    name: string;
    email: string;
  };
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: InquiryStatus;
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitInquiryDto {
  message: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface SubmitInquiryResponse {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: InquiryStatus;
  response: null;
  respondedAt: null;
  createdAt: string;
}

export interface RespondToInquiryDto {
  response: string;
}

export interface InquiryStatusUpdate {
  id: string;
  status: InquiryStatus;
  updatedAt: string;
}

export interface InquiryResponseUpdate {
  id: string;
  status: 'responded';
  response: string;
  respondedAt: string;
  updatedAt: string;
}

export interface InquiryFilters {
  status?: InquiryStatus;
  propertyId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
