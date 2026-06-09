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

const recentMessages = new Map<string, number>();
const seenMessageIds = new Set<string>();

// Cleanup old rate-limit entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of recentMessages.entries()) {
    if (now - timestamp > 60000) {
      recentMessages.delete(userId);
    }
  }
}, 60000);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: AuthenticatedSocket): void {
    console.log(`[ChatGateway] handleConnection, socket id: ${client.id}`);
    const token = client.handshake.auth?.token || this.extractTokenFromCookie(client.handshake.headers?.cookie);
    console.log(`[ChatGateway] Token found: ${!!token}`);
    if (!token) {
      console.log(`[ChatGateway] No token, disconnecting socket ${client.id}`);
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify(token);
      client.userId = payload.id;
      client.role = payload.role;
      client.join(`user:${payload.id}`);
      console.log(`[ChatGateway] Socket ${client.id} authenticated, userId: ${client.userId}, role: ${client.role}`);
    } catch (err: any) {
      console.log(`[ChatGateway] Token verification failed for socket ${client.id}:`, err?.message || err);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    console.log(`[ChatGateway] handleDisconnect, socket id: ${client.id}, userId: ${client.userId}`);
    if (client.userId) {
      client.leave(`user:${client.userId}`);
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(client: AuthenticatedSocket, conversationId: string): Promise<void> {
    console.log(`[ChatGateway] leaveConversation, socket: ${client.id}, conversation: ${conversationId}`);
    if (!client.userId) return;
    client.leave(`conversation:${conversationId}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: AuthenticatedSocket, conversationId: string): Promise<void> {
    console.log(`[ChatGateway] joinConversation, socket: ${client.id}, userId: ${client.userId}, conversation: ${conversationId}`);
    if (!client.userId) {
      console.log(`[ChatGateway] joinConversation rejected: no userId`);
      return;
    }
    const conversation = await this.chatService.getConversation(conversationId);
    if (!conversation || (conversation.renterId !== client.userId && conversation.adminId !== client.userId)) {
      console.log(`[ChatGateway] joinConversation rejected: access denied`);
      client.emit('error', { message: 'Access denied' });
      return;
    }
    client.join(`conversation:${conversationId}`);
    console.log(`[ChatGateway] Socket ${client.id} joined room conversation:${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: AuthenticatedSocket, payload: { conversationId: string; content: string; messageId?: string }): Promise<void> {
    console.log(`[ChatGateway] sendMessage, socket: ${client.id}, userId: ${client.userId}, payload:`, payload);
    if (!client.userId || !payload?.conversationId || !payload?.content) {
      console.log(`[ChatGateway] sendMessage rejected: missing data`);
      return;
    }

    // Re-validate JWT (per-message auth)
    const token = client.handshake.auth?.token || this.extractTokenFromCookie(client.handshake.headers?.cookie);
    if (!token) {
      console.log(`[ChatGateway] sendMessage rejected: no token`);
      client.emit('error', { message: 'Authentication required' });
      return;
    }
    try {
      this.jwtService.verify(token);
    } catch {
      console.log(`[ChatGateway] sendMessage rejected: token expired`);
      client.emit('error', { message: 'Session expired' });
      client.disconnect();
      return;
    }

    // Membership check
    const conversation = await this.chatService.getConversation(payload.conversationId);
    if (!conversation || (conversation.renterId !== client.userId && conversation.adminId !== client.userId)) {
      console.log(`[ChatGateway] sendMessage rejected: access denied`);
      client.emit('error', { message: 'Access denied' });
      return;
    }

    // Rate limiting: 1 message per second per user
    const now = Date.now();
    const last = recentMessages.get(client.userId);
    if (last && now - last < 1000) {
      client.emit('error', { message: 'Rate limit exceeded' });
      return;
    }
    recentMessages.set(client.userId, now);

    // Deduplication
    if (payload.messageId) {
      if (seenMessageIds.has(payload.messageId)) {
        return;
      }
      seenMessageIds.add(payload.messageId);
      if (seenMessageIds.size > 10000) {
        const iter = seenMessageIds.values();
        const first = iter.next().value;
        if (first) seenMessageIds.delete(first);
      }
    }

    const sanitizedContent = escapeHtml(payload.content.slice(0, 2000));

    const message = await this.chatService.sendMessage({
      conversationId: payload.conversationId,
      senderId: client.userId,
      senderRole: client.role || 'renter',
      content: sanitizedContent,
    });

    const messagePayload = {
      conversationId: payload.conversationId,
      message: {
        id: message.id,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        createdAt: message.createdAt,
      },
    };

    // Emit to conversation room (for clients currently viewing this conversation)
    console.log(`[ChatGateway] Broadcasting to conversation:${payload.conversationId}`);
    this.server.to(`conversation:${payload.conversationId}`).emit('newMessage', messagePayload);

    // Emit to recipient's personal room (for notifications when not on messages page)
    const recipientId = conversation.renterId === client.userId ? conversation.adminId : conversation.renterId;
    console.log(`[ChatGateway] Broadcasting to user:${recipientId}`);
    this.server.to(`user:${recipientId}`).emit('newMessage', messagePayload);
  }

  private extractTokenFromCookie(cookie?: string): string | null {
    if (!cookie) return null;
    const match = cookie.match(/access_token=([^;]+)/);
    return match ? match[1] : null;
  }
}
