import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '~/services/api/notificationService';
import type { Notification } from '~/services/api/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const [notifs, countData] = await Promise.all([
        notificationService.list(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs || []);
      setUnreadCount(countData?.count || 0);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [refetch]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
