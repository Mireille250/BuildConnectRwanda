import { DatabaseService } from '../../database/database.service';
import { CreateApplicationDto } from './dto/create-application.dto';
export declare class ApplicationsService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    applyToJob(userId: string, jobId: string, dto: CreateApplicationDto): Promise<{
        id: string;
        jobId: string;
        applicantId: string;
        coverLetter: string | null;
        proposedRate: number | null;
        status: string;
        createdAt: Date;
    }>;
    getMyApplications(userId: string): Promise<{
        id: never;
        status: never;
        coverLetter: never;
        proposedRate: never;
        createdAt: never;
        job: {
            id: never;
            title: never;
            district: never;
            budgetMin: never;
            budgetMax: never;
            status: never;
            deadline: never;
            postedBy: string;
        };
    }[]>;
    getJobApplicants(userId: string, jobId: string): Promise<{
        jobTitle: string;
        totalApplicants: number;
        applicants: {
            applicationId: never;
            status: never;
            coverLetter: never;
            proposedRate: never;
            appliedAt: never;
            applicant: {
                id: never;
                firstName: never;
                lastName: never;
                profilePhoto: never;
                district: never;
                isVerified: never;
                profession: never;
                skills: never;
                experience: never;
                rating: number;
                ratingCount: never;
            };
        }[];
    }>;
    acceptApplication(userId: string, applicationId: string): Promise<{
        message: string;
    }>;
    rejectApplication(userId: string, applicationId: string): Promise<{
        message: string;
    }>;
    withdrawApplication(userId: string, applicationId: string): Promise<{
        message: string;
    }>;
    private formatApplication;
}
