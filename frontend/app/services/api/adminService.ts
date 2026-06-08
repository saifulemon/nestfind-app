import { httpService } from '~/services/httpService';
import type { PaginatedResponse } from '~/types/api/property';
import type {
  DashboardStats,
  AdminUser,
  AdminUserDetail,
  UpdateUserStatusDto,
  UserStatusUpdate,
  UserFilters,
} from '~/types/api/admin';

export const adminService = {
  getDashboard: () =>
    httpService.get<DashboardStats>('/admin/dashboard'),

  listUsers: (filters?: UserFilters) =>
    httpService.get<PaginatedResponse<AdminUser>>('/admin/users', { params: filters }),

  getUserById: (id: string) =>
    httpService.get<AdminUserDetail>(`/admin/users/${id}`),

  updateUserStatus: (id: string, data: UpdateUserStatusDto) =>
    httpService.patch<UserStatusUpdate>(`/admin/users/${id}/status`, data),
};
