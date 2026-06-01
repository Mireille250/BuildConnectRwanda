import { DatabaseService } from '../../database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    createReview(authorId: string, dto: CreateReviewDto): Promise<{
        id: any;
        rating: any;
        comment: any;
        createdAt: any;
        targetId: string;
        jobId: string;
    }>;
    getUserReviews(targetId: string, page?: number, limit?: number): Promise<{
        targetUser: {
            id: string;
            firstName: string;
            lastName: string;
            averageRating: number;
            totalReviews: number;
        };
        data: {
            id: never;
            rating: never;
            comment: never;
            createdAt: never;
            jobId: never;
            jobTitle: never;
            author: {
                id: never;
                firstName: never;
                lastName: never;
                profilePhoto: never;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getMyReviews(userId: string, page?: number, limit?: number): Promise<{
        targetUser: {
            id: string;
            firstName: string;
            lastName: string;
            averageRating: number;
            totalReviews: number;
        };
        data: {
            id: never;
            rating: never;
            comment: never;
            createdAt: never;
            jobId: never;
            jobTitle: never;
            author: {
                id: never;
                firstName: never;
                lastName: never;
                profilePhoto: never;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getReviewsIWrote(authorId: string): Promise<{
        id: never;
        rating: never;
        comment: never;
        createdAt: never;
        jobId: never;
        jobTitle: never;
        professional: {
            id: never;
            firstName: never;
            lastName: never;
            profilePhoto: never;
            profession: never;
        };
    }[]>;
}
