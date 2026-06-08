import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(
    @InjectRepository(Notification)
    repository: Repository<Notification>,
  ) {
    super(repository);
  }

  async findByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.repository.find({
      where: { userId } as any,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId, isRead: false } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repository.count({
      where: { userId, isRead: false } as any,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isRead: false } as any,
      { isRead: true },
    );
  }
}
