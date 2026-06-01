import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    createJob(user: RequestUser, dto: CreateJobDto): Promise<{
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
    searchJobs(query: SearchJobsDto): Promise<{
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
    getSavedJobs(user: RequestUser): Promise<{
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
    getMyJobs(user: RequestUser): Promise<{
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
    getJobById(id: string): Promise<{
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
    updateJob(user: RequestUser, id: string, dto: UpdateJobDto): Promise<{
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
    deleteJob(user: RequestUser, id: string): Promise<{
        message: string;
    }>;
    saveJob(user: RequestUser, id: string): Promise<{
        message: string;
    }>;
    unsaveJob(user: RequestUser, id: string): Promise<{
        message: string;
    }>;
}
