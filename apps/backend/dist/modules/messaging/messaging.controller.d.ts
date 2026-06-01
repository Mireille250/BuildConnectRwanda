import { MessagingService } from './messaging.service';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    getOrCreateConversation(user: RequestUser, otherUserId: string): Promise<{
        conversationId: any;
        isNew: boolean;
    }>;
    getMyConversations(user: RequestUser): Promise<{
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
    getMessages(user: RequestUser, conversationId: string, page?: number, limit?: number): Promise<{
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
}
