import { Injectable } from '@nestjs/common';
import { ChatConversationRepository } from './chat-conversation.repository';
import { ChatMessageRepository } from './chat-message.repository';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly conversationRepo: ChatConversationRepository,
    private readonly messageRepo: ChatMessageRepository,
  ) {}

  async getConversations(userId: string): Promise<ChatConversation[]> {
    return this.conversationRepo.findByUser(userId);
  }

  async createConversation(data: {
    renterId: string;
    adminId: string;
    propertyId?: string;
    subject?: string;
  }): Promise<ChatConversation> {
    return this.conversationRepo.create({
      renterId: data.renterId,
      adminId: data.adminId,
      propertyId: data.propertyId || null,
      subject: data.subject || null,
      status: 'active',
    });
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.messageRepo.findByConversation(conversationId);
  }

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
  }): Promise<ChatMessage> {
    return this.messageRepo.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      content: data.content,
      isRead: false,
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepo.markAsRead(conversationId, userId);
  }
}
