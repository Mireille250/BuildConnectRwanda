import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(user: RequestUser, dto: CreateReviewDto): Promise<{
        id: any;
        rating: any;
        comment: any;
        createdAt: any;
        targetId: string;
        jobId: string;
    }>;
    getMyReviews(user: RequestUser, page?: number, limit?: number): Promise<{
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
    getReviewsIWrote(user: RequestUser): Promise<{
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
}
