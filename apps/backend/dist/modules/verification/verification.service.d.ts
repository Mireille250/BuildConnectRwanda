import { DatabaseService } from '../../database/database.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
export declare class VerificationService {
    private readonly db;
    private readonly cloudinary;
    private readonly logger;
    constructor(db: DatabaseService, cloudinary: CloudinaryService);
    uploadDocument(userId: string, file: Express.Multer.File, docType: string): Promise<{
        id: string;
        docType: string;
        fileUrl: string;
        status: string;
        adminNote: string | null;
        reviewedAt: Date | null;
        createdAt: Date;
    }>;
    getMyDocuments(userId: string): Promise<{
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
    reviewDocument(adminId: string, documentId: string, dto: ReviewDocumentDto): Promise<{
        message: string;
        documentId: string;
        decision: import("./dto/review-document.dto").VerificationDecision;
    }>;
    getUserDocuments(targetUserId: string): Promise<{
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
    private checkAndVerifyUser;
    private formatDoc;
}
