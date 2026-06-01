import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    applyToJob(user: RequestUser, jobId: string, dto: CreateApplicationDto): Promise<{
        id: string;
        jobId: string;
        applicantId: string;
        coverLetter: string | null;
        proposedRate: number | null;
        status: string;
        createdAt: Date;
    }>;
    getMyApplications(user: RequestUser): Promise<{
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
    getJobApplicants(user: RequestUser, jobId: string): Promise<{
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
    acceptApplication(user: RequestUser, id: string): Promise<{
        message: string;
    }>;
    rejectApplication(user: RequestUser, id: string): Promise<{
        message: string;
    }>;
    withdrawApplication(user: RequestUser, id: string): Promise<{
        message: string;
    }>;
}
