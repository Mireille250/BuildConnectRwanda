"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const messaging_service_1 = require("./messaging.service");
let MessagingGateway = MessagingGateway_1 = class MessagingGateway {
    messagingService;
    jwt;
    config;
    server;
    logger = new common_1.Logger(MessagingGateway_1.name);
    onlineUsers = new Map();
    constructor(messagingService, jwt, config) {
        this.messagingService = messagingService;
        this.jwt = jwt;
        this.config = config;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token)
                throw new common_1.UnauthorizedException('No token provided');
            const payload = this.jwt.verify(token, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
            });
            client.userId = payload.sub;
            client.userEmail = payload.email;
            this.onlineUsers.set(payload.sub, client.id);
            client.join(`user:${payload.sub}`);
            this.logger.log(`Client connected: ${payload.email} (${client.id})`);
            client.emit('connected', { userId: payload.sub });
        }
        catch {
            this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
            client.emit('error', { message: 'Unauthorized' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.onlineUsers.delete(client.userId);
            this.logger.log(`Client disconnected: ${client.userId}`);
        }
    }
    async handleSendMessage(client, data) {
        try {
            const message = await this.messagingService.saveMessage(client.userId, data.receiverId, data.conversationId, data.content);
            client.emit('messageSent', message);
            const receiverSocketRoom = `user:${data.receiverId}`;
            this.server.to(receiverSocketRoom).emit('newMessage', {
                ...message,
                conversationId: data.conversationId,
            });
            if (this.onlineUsers.has(data.receiverId)) {
                await this.messagingService.markDelivered(message.id);
                client.emit('messageDelivered', { messageId: message.id });
            }
        }
        catch (error) {
            client.emit('error', { message: 'Failed to send message' });
        }
    }
    handleTyping(client, data) {
        this.server.to(`user:${data.receiverId}`).emit('userTyping', {
            userId: client.userId,
            conversationId: data.conversationId,
        });
    }
    handleStopTyping(client, data) {
        this.server.to(`user:${data.receiverId}`).emit('userStoppedTyping', {
            userId: client.userId,
            conversationId: data.conversationId,
        });
    }
    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stopTyping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleStopTyping", null);
exports.MessagingGateway = MessagingGateway = MessagingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/messaging',
    }),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService,
        jwt_1.JwtService,
        config_1.ConfigService])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map