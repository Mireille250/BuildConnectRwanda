import { DatabaseService } from '../../database/database.service';
export declare class MessagingService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    getOrCreateConversation(userId: string, otherUserId: string): Promise<{
        conversationId: any;
        isNew: boolean;
    }>;
    getMyConversations(userId: string): Promise<{
        conversationId: never;
        updatedAt: never;
        unreadCount: number;
        lastMessage: never;
        lastMessageAt: never;
        otherUser: {
            id: never;
            firstName: never;
            lastName: never;
            profilePhoto: never;
            role: never;
        };
    }[]>;
    getMessages(userId: string, conversationId: string, page?: number, limit?: number): Promise<{
        id: never;
        content: never;
        status: never;
        createdAt: never;
        senderId: never;
        receiverId: never;
        sender: {
            firstName: never;
            lastName: never;
            profilePhoto: never;
        };
    }[]>;
    saveMessage(senderId: string, receiverId: string, conversationId: string, content: string): Promise<Record<string, never> | null>;
    markDelivered(messageId: string): Promise<void>;
}
