import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SearchProfessionalsDto } from './dto/search-professionals.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly db: DatabaseService) {}

  async searchProfessionals(dto: SearchProfessionalsDto) {
    const {
      profession,
      district,
      skill,
      minExperience,
      minRating,
      available,
      verified,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 10,
    } = dto;

    // We build the WHERE clause dynamically.
    // Each filter adds a condition and a parameter.
    // $1, $2, $3... are added in order as filters are applied.
    const conditions: string[] = [
      'u.is_active = true',
      // Exclude ADMIN and CLIENT from professional search
      "u.role IN ('ENGINEER', 'WORKER', 'COMPANY', 'SUPPLIER')",
    ];
    const params: unknown[] = [];
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
      // PostgreSQL array contains: checks if skills array has this skill
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

    // Build ORDER BY — whitelist to prevent SQL injection
    const allowedSortFields: Record<string, string> = {
      rating: 'p.rating',
      experience: 'p.experience',
      createdAt: 'u.created_at',
    };
    const sortField = allowedSortFields[sortBy] ?? 'p.rating';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    // Pagination
    const offset = (page - 1) * limit;

    // Main query — joins users and profiles
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

    // Count query — same WHERE, no ORDER/LIMIT
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE ${whereClause}
    `;

    // Run both queries in parallel for performance
    const [results, countResult] = await Promise.all([
      this.db.queryMany(dataQuery, [...params, limit, offset]),
      this.db.queryOne<{ total: string }>(countQuery, params),
    ]);

    const total = parseInt(countResult?.total ?? '0', 10);
    const totalPages = Math.ceil(total / limit);

    this.logger.log(
      `Search: profession=${profession ?? 'any'}, district=${district ?? 'any'}, results=${results.length}/${total}`,
    );

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

  private formatResult(row: Record<string, unknown>) {
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
      rating: row.rating ? parseFloat(row.rating as string) : 0,
      ratingCount: row.rating_count,
      companyName: row.company_name,
      portfolioUrl: row.portfolio_url,
    };
  }
}