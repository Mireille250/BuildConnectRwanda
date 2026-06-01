import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
interface AuthenticatedSocket extends Socket {
    userId: string;
    userEmail: string;
}
export declare class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly messagingService;
    private readonly jwt;
    private readonly config;
    server: Server;
    private readonly logger;
    private onlineUsers;
    constructor(messagingService: MessagingService, jwt: JwtService, config: ConfigService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleSendMessage(client: AuthenticatedSocket, data: {
        receiverId: string;
        conversationId: string;
        content: string;
    }): Promise<void>;
    handleTyping(client: AuthenticatedSocket, data: {
        receiverId: string;
        conversationId: string;
    }): void;
    handleStopTyping(client: AuthenticatedSocket, data: {
        receiverId: string;
        conversationId: string;
    }): void;
    isUserOnline(userId: string): boolean;
}
export {};
