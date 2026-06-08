export interface PropertyView {
  id: string;
  userId: string;
  propertyId: string;
  viewCount: number;
  lastViewedAt: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
    addressCity: string;
    addressState: string;
    photos?: { url: string; isPrimary: boolean }[];
  };
}
