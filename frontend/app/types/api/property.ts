export const PROPERTY_TYPES = ['apartment', 'house', 'condo', 'townhouse', 'studio'] as const;
export type PropertyTypeEnum = (typeof PROPERTY_TYPES)[number];

export interface PropertyPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AmenityDto {
  id: string;
  name: string;
  icon: string;
}

export interface PropertyListItem {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: PropertyTypeEnum;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  availableFrom?: string;
  primaryPhoto?: string | null;
  amenities: AmenityDto[];
  createdAt: string;
}

export interface PropertyDetail extends PropertyListItem {
  isFavorited: boolean;
  photos: PropertyPhoto[];
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertySearchParams {
  search?: string;
  propertyType?: PropertyTypeEnum;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  propertyType: PropertyTypeEnum;
  address: AddressDto;
  availableFrom?: string;
  amenityIds: string[];
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;
