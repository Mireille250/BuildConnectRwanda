import { SearchService } from './search.service';
import { SearchProfessionalsDto } from './dto/search-professionals.dto';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchProfessionals(query: SearchProfessionalsDto): Promise<{
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
}
