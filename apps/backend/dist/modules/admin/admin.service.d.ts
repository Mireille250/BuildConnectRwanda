import { DatabaseService } from '../../database/database.service';
export declare class AdminService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    getStats(): Promise<{
        users: {
            total: number;
            byRole: {
                role: never;
                count: number;
                verifiedCount: number;
                activeCount: number;
            }[];
        };
        jobs: {
            byStatus: {
                status: never;
                count: number;
            }[];
            total: number;
        };
        applications: {
            byStatus: {
                status: never;
                count: number;
            }[];
            total: number;
        };
        reviews: {
            total: number;
            averageRating: number;
        };
        verification: {
            byStatus: {
                status: never;
                count: number;
            }[];
        };
    }>;
    getUsers(page?: number, limit?: number, role?: string, search?: string, isActive?: boolean, isVerified?: boolean): Promise<{
        data: {
            id: never;
            email: never;
            firstName: never;
            lastName: never;
            role: never;
            district: never;
            isVerified: never;
            isActive: never;
            createdAt: never;
            profession: never;
            rating: number;
            ratingCount: never;
            applicationCount: number;
            jobCount: number;
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
    getUserDetail(userId: string): Promise<{
        id: never;
        email: never;
        firstName: never;
        lastName: never;
        role: never;
        phone: never;
        district: never;
        isVerified: never;
        isActive: never;
        createdAt: never;
        profile: {
            profession: never;
            skills: never;
            experience: never;
            rating: never;
            ratingCount: never;
        };
        verificationDocs: Record<string, never>[];
        recentJobs: Record<string, never>[];
        recentApplications: Record<string, never>[];
    }>;
    toggleUserStatus(adminId: string, userId: string, isActive: boolean): Promise<{
        message: string;
        userId: string;
        isActive: boolean;
    }>;
    getJobs(page?: number, limit?: number, status?: string): Promise<{
        data: {
            id: never;
            title: never;
            district: never;
            status: never;
            budgetMin: never;
            budgetMax: never;
            profession: never;
            createdAt: never;
            applicationCount: number;
            postedBy: {
                firstName: never;
                lastName: never;
                email: never;
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
    deleteJob(adminId: string, jobId: string): Promise<{
        message: string;
        jobId: string;
    }>;
    getRecentActivity(): Promise<{
        recentUsers: {
            id: never;
            email: never;
            name: string;
            role: never;
            joinedAt: never;
        }[];
        recentJobs: {
            id: never;
            title: never;
            district: never;
            status: never;
            postedBy: string;
            createdAt: never;
        }[];
        recentApplications: {
            id: never;
            status: never;
            jobTitle: never;
            applicant: string;
            createdAt: never;
        }[];
        recentReviews: {
            id: never;
            rating: never;
            comment: never;
            author: string;
            target: string;
            createdAt: never;
        }[];
    }>;
}
