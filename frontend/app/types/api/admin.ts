export interface DashboardStats {
  totalProperties: number;
  totalInquiries: number;
  newInquiries: number;
  totalUsers: number;
  recentInquiries: Array<{
    id: string;
    name: string;
    email: string;
    propertyTitle: string;
    status: string;
    createdAt: string;
  }>;
  recentProperties: Array<{
    id: string;
    title: string;
    price: number;
    propertyType: string;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'renter' | 'admin';
  status: 'active' | 'suspended';
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  activity: {
    totalFavorites: number;
    totalInquiries: number;
    lastLoginAt?: string | null;
  };
  updatedAt: string;
}

export interface UpdateUserStatusDto {
  status: 'active' | 'suspended';
}

export interface UserStatusUpdate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  updatedAt: string;
}

export interface UserFilters {
  role?: 'renter' | 'admin';
  status?: 'active' | 'suspended';
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
