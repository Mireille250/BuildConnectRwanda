import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userEmail: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messaging',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  // Track online users: userId → socketId
  private onlineUsers = new Map<string, string>();

  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Connection ────────────────────────────────────────────────────────────

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) throw new UnauthorizedException('No token provided');

      // Verify JWT
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      }) as { sub: string; email: string };

      client.userId = payload.sub;
      client.userEmail = payload.email;

      // Track online status
      this.onlineUsers.set(payload.sub, client.id);

      // Join a personal room so we can send messages directly to this user
      client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${payload.email} (${client.id})`);

      // Notify the client they are connected
      client.emit('connected', { userId: payload.sub });

    } catch {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.onlineUsers.delete(client.userId);
      this.logger.log(`Client disconnected: ${client.userId}`);
    }
  }

  // ─── Send Message ──────────────────────────────────────────────────────────

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { receiverId: string; conversationId: string; content: string },
  ) {
    try {
      const message = await this.messagingService.saveMessage(
        client.userId,
        data.receiverId,
        data.conversationId,
        data.content,
      );

      // Send back to sender as confirmation
      client.emit('messageSent', message);

      // Send to receiver if they are online
      const receiverSocketRoom = `user:${data.receiverId}`;
      this.server.to(receiverSocketRoom).emit('newMessage', {
        ...message,
        conversationId: data.conversationId,
      });

      // Mark as DELIVERED if receiver is online
      if (this.onlineUsers.has(data.receiverId)) {
        await this.messagingService.markDelivered(message!.id as string);
        client.emit('messageDelivered', { messageId: message!.id });
      }

    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // ─── Typing Indicator ──────────────────────────────────────────────────────

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; conversationId: string },
  ) {
    this.server.to(`user:${data.receiverId}`).emit('userTyping', {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; conversationId: string },
  ) {
    this.server.to(`user:${data.receiverId}`).emit('userStoppedTyping', {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }

  // ─── Helper: Check if user is online ──────────────────────────────────────

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}