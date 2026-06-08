import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { User } from '../../core/decorators/current-user.decorator';
import { NotificationService } from './notification.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'User notifications' })
  async getNotifications(@User('id') userId: string) {
    const notifications = await this.notificationService.getUserNotifications(userId);
    return {
      statusCode: 200,
      message: 'Notifications retrieved',
      data: notifications,
    };
  }

  @Get('unread-count')
  @ApiResponse({ status: 200, description: 'Unread notification count' })
  async getUnreadCount(@User('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return {
      statusCode: 200,
      message: 'Unread count retrieved',
      data: { count },
    };
  }

  @Patch(':id/read')
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @User('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.notificationService.markAsRead(userId, id);
    return {
      statusCode: 200,
      message: 'Marked as read',
    };
  }

  @Patch('read-all')
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@User('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return {
      statusCode: 200,
      message: 'All marked as read',
    };
  }
}
