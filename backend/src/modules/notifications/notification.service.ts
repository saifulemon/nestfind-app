import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/base/base.service';
import { NotificationRepository } from './notification.repository';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService extends BaseService<Notification> {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {
    super(notificationRepository, 'Notification');
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    return this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || null,
      isRead: false,
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUser(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
