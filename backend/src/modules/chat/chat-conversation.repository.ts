import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../core/base/base.repository';
import { ChatConversation } from './entities/chat-conversation.entity';

@Injectable()
export class ChatConversationRepository extends BaseRepository<ChatConversation> {
  constructor(
    @InjectRepository(ChatConversation)
    repository: Repository<ChatConversation>,
  ) {
    super(repository);
  }

  async findByUser(userId: string): Promise<ChatConversation[]> {
    return this.repository.find({
      where: [
        { renterId: userId },
        { adminId: userId },
      ] as any,
      relations: ['property', 'renter', 'admin'],
      order: { updatedAt: 'DESC' },
    });
  }
}
