import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatMessageRepository extends BaseRepository<ChatMessage> {
  constructor(
    @InjectRepository(ChatMessage)
    repository: Repository<ChatMessage>,
  ) {
    super(repository);
  }

  async findByConversation(conversationId: string): Promise<ChatMessage[]> {
    return this.repository.find({
      where: { conversationId } as any,
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.repository.update(
      { conversationId, senderId: userId, isRead: false } as any,
      { isRead: true },
    );
  }
}
