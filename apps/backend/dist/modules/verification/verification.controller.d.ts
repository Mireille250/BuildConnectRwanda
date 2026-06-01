import { VerificationService } from './verification.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    uploadDocument(user: RequestUser, file: Express.Multer.File, docType: string): Promise<{
        id: string;
        docType: string;
        fileUrl: string;
        status: string;
        adminNote: string | null;
        reviewedAt: Date | null;
        createdAt: Date;
    }>;
    getMyDocuments(user: RequestUser): Promise<{
        id: string;
        docType: string;
        fileUrl: string;
        status: string;
        adminNote: string | null;
        reviewedAt: Date | null;
        createdAt: Date;
    }[]>;
    getPendingDocuments(page?: number, limit?: number): Promise<{
        data: {
            id: never;
            docType: never;
            fileUrl: never;
            status: never;
            createdAt: never;
            user: {
                id: never;
                firstName: never;
                lastName: never;
                email: never;
                role: never;
                district: never;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserDocuments(userId: string): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            isVerified: boolean;
        };
        documents: {
            id: string;
            docType: string;
            fileUrl: string;
            status: string;
            adminNote: string | null;
            reviewedAt: Date | null;
            createdAt: Date;
        }[];
    }>;
    reviewDocument(user: RequestUser, documentId: string, dto: ReviewDocumentDto): Promise<{
        message: string;
        documentId: string;
        decision: import("./dto/review-document.dto").VerificationDecision;
    }>;
}
