import { UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'nestfind' })
export class NestfindGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly jwtService: JwtService) {}

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

  @SubscribeMessage('newInquiry')
  handleNewInquiry(client: AuthenticatedSocket, payload: any): void {
    if (!client.userId) return;
    if (!payload || typeof payload !== 'object') return;
    const sanitized = {
      propertyId: typeof payload.propertyId === 'string' ? payload.propertyId.slice(0, 64) : undefined,
      message: typeof payload.message === 'string' ? payload.message.slice(0, 1000) : undefined,
    };
    if (!sanitized.propertyId || !sanitized.message) return;
    client.to(`user:${client.userId}`).emit('inquiryNotification', sanitized);
  }

  @SubscribeMessage('propertyUpdate')
  handlePropertyUpdate(client: AuthenticatedSocket, payload: any): void {
    if (!client.userId) return;
    if (!payload || typeof payload !== 'object') return;
    const sanitized = {
      propertyId: typeof payload.propertyId === 'string' ? payload.propertyId.slice(0, 64) : undefined,
      type: typeof payload.type === 'string' ? payload.type.slice(0, 32) : undefined,
    };
    if (!sanitized.propertyId || !sanitized.type) return;
    client.to(`user:${client.userId}`).emit('propertyNotification', sanitized);
  }

  private extractTokenFromCookie(cookie?: string): string | null {
    if (!cookie) return null;
    const match = cookie.match(/access_token=([^;]+)/);
    return match ? match[1] : null;
  }
}
