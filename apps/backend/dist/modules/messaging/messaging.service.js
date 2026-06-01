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
var MessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let MessagingService = MessagingService_1 = class MessagingService {
    db;
    logger = new common_1.Logger(MessagingService_1.name);
    constructor(db) {
        this.db = db;
    }
    async getOrCreateConversation(userId, otherUserId) {
        const otherUser = await this.db.queryOne('SELECT id, first_name, last_name FROM users WHERE id = $1 AND is_active = true', [otherUserId]);
        if (!otherUser)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.db.queryOne(`SELECT c.id
       FROM conversations c
       JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = $1
       JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = $2
       LIMIT 1`, [userId, otherUserId]);
        if (existing) {
            return { conversationId: existing.id, isNew: false };
        }
        const conversation = await this.db.transaction(async (client) => {
            const conv = await client.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
            const convId = conv.rows[0].id;
            await client.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)', [convId, userId, otherUserId]);
            return convId;
        });
        this.logger.log(`Conversation created between ${userId} and ${otherUserId}`);
        return { conversationId: conversation, isNew: true };
    }
    async getMyConversations(userId) {
        const conversations = await this.db.queryMany(`SELECT
       c.id AS conversation_id,
       c.updated_at,
       u.id            AS other_user_id,
       u.first_name    AS other_first_name,
       u.last_name     AS other_last_name,
       u.profile_photo AS other_photo,
       u.role          AS other_role,
       (
         SELECT content FROM messages m
         WHERE m.conversation_id = c.id
         ORDER BY m.created_at DESC LIMIT 1
       ) AS last_message,
       (
         SELECT created_at FROM messages m
         WHERE m.conversation_id = c.id
         ORDER BY m.created_at DESC LIMIT 1
       ) AS last_message_at,
       (
         SELECT COUNT(*) FROM messages m
         WHERE m.conversation_id = c.id
           AND m.receiver_id = $1
           AND m.status != 'READ'
       ) AS unread_count
     FROM conversations c
     JOIN conversation_members cm  ON cm.conversation_id  = c.id AND cm.user_id  = $1
     JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id != $1
     JOIN users u ON u.id = cm2.user_id
     ORDER BY c.updated_at DESC`, [userId]);
        return conversations.map((c) => ({
            conversationId: c.conversation_id,
            updatedAt: c.updated_at,
            unreadCount: parseInt(c.unread_count, 10),
            lastMessage: c.last_message,
            lastMessageAt: c.last_message_at,
            otherUser: {
                id: c.other_user_id,
                firstName: c.other_first_name,
                lastName: c.other_last_name,
                profilePhoto: c.other_photo,
                role: c.other_role,
            },
        }));
    }
    async getMessages(userId, conversationId, page = 1, limit = 50) {
        const member = await this.db.queryOne('SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2', [conversationId, userId]);
        if (!member)
            throw new common_1.ForbiddenException('You are not a member of this conversation');
        const offset = (page - 1) * limit;
        const messages = await this.db.queryMany(`SELECT
         m.id, m.content, m.status, m.created_at,
         m.sender_id, m.receiver_id,
         u.first_name AS sender_first_name,
         u.last_name  AS sender_last_name,
         u.profile_photo AS sender_photo
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`, [conversationId, limit, offset]);
        await this.db.query(`UPDATE messages SET status = 'READ'
       WHERE conversation_id = $1 AND receiver_id = $2 AND status != 'READ'`, [conversationId, userId]);
        return messages.reverse().map((m) => ({
            id: m.id,
            content: m.content,
            status: m.status,
            createdAt: m.created_at,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            sender: {
                firstName: m.sender_first_name,
                lastName: m.sender_last_name,
                profilePhoto: m.sender_photo,
            },
        }));
    }
    async saveMessage(senderId, receiverId, conversationId, content) {
        const member = await this.db.queryOne('SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2', [conversationId, senderId]);
        if (!member)
            throw new common_1.ForbiddenException('You are not a member of this conversation');
        const message = await this.db.queryOne(`INSERT INTO messages (conversation_id, sender_id, receiver_id, content, status)
       VALUES ($1, $2, $3, $4, 'SENT')
       RETURNING id, content, status, created_at, sender_id, receiver_id`, [conversationId, senderId, receiverId, content]);
        await this.db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
        return message;
    }
    async markDelivered(messageId) {
        await this.db.query(`UPDATE messages SET status = 'DELIVERED' WHERE id = $1 AND status = 'SENT'`, [messageId]);
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = MessagingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map