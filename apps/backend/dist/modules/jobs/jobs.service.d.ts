import { DatabaseService } from '../../database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
export declare class JobsService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    createJob(userId: string, dto: CreateJobDto): Promise<{
        id: string;
        title: string;
        description: string;
        district: string;
        budgetMin: number | null;
        budgetMax: number | null;
        requiredSkills: string[];
        profession: string | null;
        status: string;
        startDate: Date | null;
        deadline: Date | null;
        createdAt: Date;
    }>;
    searchJobs(dto: SearchJobsDto): Promise<{
        data: {
            id: unknown;
            title: unknown;
            description: unknown;
            district: unknown;
            budgetMin: unknown;
            budgetMax: unknown;
            requiredSkills: unknown;
            profession: unknown;
            status: unknown;
            startDate: unknown;
            deadline: unknown;
            createdAt: unknown;
            applicationCount: number;
            postedBy: {
                id: unknown;
                firstName: unknown;
                lastName: unknown;
                profilePhoto: unknown;
                isVerified: unknown;
                district: unknown;
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
    getJobById(jobId: string): Promise<{
        id: unknown;
        title: unknown;
        description: unknown;
        district: unknown;
        budgetMin: unknown;
        budgetMax: unknown;
        requiredSkills: unknown;
        profession: unknown;
        status: unknown;
        startDate: unknown;
        deadline: unknown;
        createdAt: unknown;
        applicationCount: number;
        postedBy: {
            id: unknown;
            firstName: unknown;
            lastName: unknown;
            profilePhoto: unknown;
            isVerified: unknown;
            district: unknown;
        };
    }>;
    getMyJobs(userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        district: string;
        budgetMin: number | null;
        budgetMax: number | null;
        requiredSkills: string[];
        profession: string | null;
        status: string;
        startDate: Date | null;
        deadline: Date | null;
        createdAt: Date;
    }[]>;
    updateJob(userId: string, jobId: string, dto: UpdateJobDto): Promise<{
        id: string;
        title: string;
        description: string;
        district: string;
        budgetMin: number | null;
        budgetMax: number | null;
        requiredSkills: string[];
        profession: string | null;
        status: string;
        startDate: Date | null;
        deadline: Date | null;
        createdAt: Date;
    }>;
    deleteJob(userId: string, jobId: string): Promise<{
        message: string;
    }>;
    saveJob(userId: string, jobId: string): Promise<{
        message: string;
    }>;
    unsaveJob(userId: string, jobId: string): Promise<{
        message: string;
    }>;
    getSavedJobs(userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        district: string;
        budgetMin: number | null;
        budgetMax: number | null;
        requiredSkills: string[];
        profession: string | null;
        status: string;
        startDate: Date | null;
        deadline: Date | null;
        createdAt: Date;
    }[]>;
    private formatJob;
    private formatJobWithPoster;
}
