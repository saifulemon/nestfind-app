import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: AuthenticatedSocket): void {
    const token = client.handshake.auth?.token || this.extractTokenFromCookie(client.handshake.headers?.cookie);
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.role = payload.role;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      client.leave(`user:${client.userId}`);
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: AuthenticatedSocket, conversationId: string): void {
    if (!client.userId) return;
    client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: AuthenticatedSocket, payload: { conversationId: string; content: string }): Promise<void> {
    if (!client.userId || !payload?.conversationId || !payload?.content) return;

    const message = await this.chatService.sendMessage({
      conversationId: payload.conversationId,
      senderId: client.userId,
      senderRole: client.role || 'renter',
      content: payload.content.slice(0, 2000),
    });

    this.server.to(`conversation:${payload.conversationId}`).emit('newMessage', {
      conversationId: payload.conversationId,
      message: {
        id: message.id,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        createdAt: message.createdAt,
      },
    });
  }

  private extractTokenFromCookie(cookie?: string): string | null {
    if (!cookie) return null;
    const match = cookie.match(/access_token=([^;]+)/);
    return match ? match[1] : null;
  }
}
