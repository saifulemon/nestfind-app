export interface FavoriteItem {
  id: string;
  property: {
    id: string;
    title: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
    addressCity: string;
    addressState: string;
    primaryPhoto?: string | null;
  };
  createdAt: string;
}

export interface AddFavoriteResponse {
  id: string;
  propertyId: string;
  createdAt: string;
}

export interface AddFavoriteDto {
  propertyId: string;
}
