import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { User } from '../../core/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiResponse({ status: 200, description: 'User conversations' })
  async getConversations(@User('id') userId: string) {
    const conversations = await this.chatService.getConversations(userId);
    return {
      statusCode: 200,
      message: 'Conversations retrieved',
      data: conversations,
    };
  }

  @Post('conversations')
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async createConversation(
    @User('id') userId: string,
    @Body() body: { adminId: string; propertyId?: string; subject?: string },
  ) {
    const conversation = await this.chatService.createConversation({
      renterId: userId,
      adminId: body.adminId,
      propertyId: body.propertyId,
      subject: body.subject,
    });
    return {
      statusCode: 201,
      message: 'Conversation created',
      data: conversation,
    };
  }

  @Get('conversations/:id/messages')
  @ApiResponse({ status: 200, description: 'Conversation messages' })
  async getMessages(@Param('id') id: string) {
    const messages = await this.chatService.getMessages(id);
    return {
      statusCode: 200,
      message: 'Messages retrieved',
      data: messages,
    };
  }

  @Post('conversations/:id/messages')
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @User('id') userId: string,
    @User('role') role: string,
    @Param('id') conversationId: string,
    @Body() body: { content: string },
  ) {
    const message = await this.chatService.sendMessage({
      conversationId,
      senderId: userId,
      senderRole: role,
      content: body.content,
    });
    return {
      statusCode: 201,
      message: 'Message sent',
      data: message,
    };
  }

  @Patch('conversations/:id/read')
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(
    @User('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    await this.chatService.markMessagesAsRead(conversationId, userId);
    return {
      statusCode: 200,
      message: 'Marked as read',
    };
  }
}
