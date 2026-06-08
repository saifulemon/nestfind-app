import { httpService } from '~/services/httpService';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  list: () =>
    httpService.get<Notification[]>('/notifications'),

  getUnreadCount: () =>
    httpService.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    httpService.patch<void>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    httpService.patch<void>('/notifications/read-all'),
};
