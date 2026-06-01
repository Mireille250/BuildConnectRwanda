import { DatabaseService } from '../../database/database.service';
import { SearchProfessionalsDto } from './dto/search-professionals.dto';
export declare class SearchService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    searchProfessionals(dto: SearchProfessionalsDto): Promise<{
        data: {
            id: unknown;
            firstName: unknown;
            lastName: unknown;
            role: unknown;
            profilePhoto: unknown;
            district: unknown;
            isVerified: unknown;
            profession: unknown;
            skills: unknown;
            experience: unknown;
            availability: unknown;
            rating: number;
            ratingCount: unknown;
            companyName: unknown;
            portfolioUrl: unknown;
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
    private formatResult;
}
