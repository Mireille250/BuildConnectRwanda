"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let SearchService = SearchService_1 = class SearchService {
    db;
    logger = new common_1.Logger(SearchService_1.name);
    constructor(db) {
        this.db = db;
    }
    async searchProfessionals(dto) {
        const { profession, district, skill, minExperience, minRating, available, verified, sortBy = 'rating', order = 'desc', page = 1, limit = 10, } = dto;
        const conditions = [
            'u.is_active = true',
            "u.role IN ('ENGINEER', 'WORKER', 'COMPANY', 'SUPPLIER')",
        ];
        const params = [];
        let paramIndex = 1;
        if (profession) {
            conditions.push(`p.profession ILIKE $${paramIndex}`);
            params.push(`%${profession}%`);
            paramIndex++;
        }
        if (district) {
            conditions.push(`u.district ILIKE $${paramIndex}`);
            params.push(`%${district}%`);
            paramIndex++;
        }
        if (skill) {
            conditions.push(`$${paramIndex} ILIKE ANY(p.skills)`);
            params.push(`%${skill}%`);
            paramIndex++;
        }
        if (minExperience !== undefined) {
            conditions.push(`p.experience >= $${paramIndex}`);
            params.push(minExperience);
            paramIndex++;
        }
        if (minRating !== undefined) {
            conditions.push(`p.rating >= $${paramIndex}`);
            params.push(minRating);
            paramIndex++;
        }
        if (available === true) {
            conditions.push(`p.availability = true`);
        }
        if (verified === true) {
            conditions.push(`u.is_verified = true`);
        }
        const allowedSortFields = {
            rating: 'p.rating',
            experience: 'p.experience',
            createdAt: 'u.created_at',
        };
        const sortField = allowedSortFields[sortBy] ?? 'p.rating';
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * limit;
        const dataQuery = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.profile_photo,
        u.district,
        u.is_verified,
        p.profession,
        p.skills,
        p.experience,
        p.availability,
        p.rating,
        p.rating_count,
        p.company_name,
        p.portfolio_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortOrder} NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE ${whereClause}
    `;
        const [results, countResult] = await Promise.all([
            this.db.queryMany(dataQuery, [...params, limit, offset]),
            this.db.queryOne(countQuery, params),
        ]);
        const total = parseInt(countResult?.total ?? '0', 10);
        const totalPages = Math.ceil(total / limit);
        this.logger.log(`Search: profession=${profession ?? 'any'}, district=${district ?? 'any'}, results=${results.length}/${total}`);
        return {
            data: results.map((r) => this.formatResult(r)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    formatResult(row) {
        return {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            profilePhoto: row.profile_photo,
            district: row.district,
            isVerified: row.is_verified,
            profession: row.profession,
            skills: row.skills,
            experience: row.experience,
            availability: row.availability,
            rating: row.rating ? parseFloat(row.rating) : 0,
            ratingCount: row.rating_count,
            companyName: row.company_name,
            portfolioUrl: row.portfolio_url,
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SearchService);
//# sourceMappingURL=search.service.js.map