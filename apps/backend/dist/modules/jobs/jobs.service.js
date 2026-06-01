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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let JobsService = JobsService_1 = class JobsService {
    db;
    logger = new common_1.Logger(JobsService_1.name);
    constructor(db) {
        this.db = db;
    }
    async createJob(userId, dto) {
        if (dto.budgetMin && dto.budgetMax && dto.budgetMin > dto.budgetMax) {
            throw new common_1.BadRequestException('budgetMin cannot be greater than budgetMax');
        }
        const job = await this.db.queryOne(`INSERT INTO jobs
         (title, description, district, budget_min, budget_max,
          required_skills, profession, posted_by_id, start_date, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`, [
            dto.title,
            dto.description,
            dto.district,
            dto.budgetMin ?? null,
            dto.budgetMax ?? null,
            dto.requiredSkills ?? [],
            dto.profession ?? null,
            userId,
            dto.startDate ?? null,
            dto.deadline ?? null,
        ]);
        this.logger.log(`Job created: ${job.title} by user ${userId}`);
        return this.formatJob(job);
    }
    async searchJobs(dto) {
        const { district, profession, skill, minBudget, maxBudget, status = 'OPEN', keyword, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10, } = dto;
        const conditions = [];
        const params = [];
        let i = 1;
        if (status) {
            conditions.push(`j.status = $${i}`);
            params.push(status);
            i++;
        }
        if (district) {
            conditions.push(`j.district ILIKE $${i}`);
            params.push(`%${district}%`);
            i++;
        }
        if (profession) {
            conditions.push(`j.profession ILIKE $${i}`);
            params.push(`%${profession}%`);
            i++;
        }
        if (skill) {
            conditions.push(`$${i} ILIKE ANY(j.required_skills)`);
            params.push(`%${skill}%`);
            i++;
        }
        if (minBudget !== undefined) {
            conditions.push(`j.budget_max >= $${i}`);
            params.push(minBudget);
            i++;
        }
        if (maxBudget !== undefined) {
            conditions.push(`j.budget_min <= $${i}`);
            params.push(maxBudget);
            i++;
        }
        if (keyword) {
            conditions.push(`(j.title ILIKE $${i} OR j.description ILIKE $${i})`);
            params.push(`%${keyword}%`);
            i++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const allowedSort = {
            createdAt: 'j.created_at',
            budgetMin: 'j.budget_min',
            budgetMax: 'j.budget_max',
            deadline: 'j.deadline',
        };
        const sortField = allowedSort[sortBy] ?? 'j.created_at';
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        const offset = (page - 1) * limit;
        const dataQuery = `
      SELECT
        j.id, j.title, j.description, j.district,
        j.budget_min, j.budget_max, j.required_skills,
        j.profession, j.status, j.start_date, j.deadline,
        j.created_at,
        u.id        AS poster_id,
        u.first_name AS poster_first_name,
        u.last_name  AS poster_last_name,
        u.profile_photo AS poster_photo,
        u.is_verified   AS poster_verified
      FROM jobs j
      JOIN users u ON u.id = j.posted_by_id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder} NULLS LAST
      LIMIT $${i} OFFSET $${i + 1}
    `;
        const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      JOIN users u ON u.id = j.posted_by_id
      ${whereClause}
    `;
        const [results, countResult] = await Promise.all([
            this.db.queryMany(dataQuery, [...params, limit, offset]),
            this.db.queryOne(countQuery, params),
        ]);
        const total = parseInt(countResult?.total ?? '0', 10);
        return {
            data: results.map((r) => this.formatJobWithPoster(r)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        };
    }
    async getJobById(jobId) {
        const job = await this.db.queryOne(`SELECT
         j.*,
         u.id          AS poster_id,
         u.first_name  AS poster_first_name,
         u.last_name   AS poster_last_name,
         u.profile_photo AS poster_photo,
         u.is_verified   AS poster_verified,
         u.district      AS poster_district,
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
       FROM jobs j
       JOIN users u ON u.id = j.posted_by_id
       WHERE j.id = $1`, [jobId]);
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        return this.formatJobWithPoster(job);
    }
    async getMyJobs(userId) {
        const jobs = await this.db.queryMany(`SELECT j.*,
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
       FROM jobs j
       WHERE j.posted_by_id = $1
       ORDER BY j.created_at DESC`, [userId]);
        return jobs.map((j) => this.formatJob(j));
    }
    async updateJob(userId, jobId, dto) {
        const job = await this.db.queryOne('SELECT * FROM jobs WHERE id = $1', [jobId]);
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.posted_by_id !== userId) {
            throw new common_1.ForbiddenException('You can only update your own jobs');
        }
        const updated = await this.db.queryOne(`UPDATE jobs SET
         title           = COALESCE($1,  title),
         description     = COALESCE($2,  description),
         district        = COALESCE($3,  district),
         budget_min      = COALESCE($4,  budget_min),
         budget_max      = COALESCE($5,  budget_max),
         required_skills = COALESCE($6,  required_skills),
         profession      = COALESCE($7,  profession),
         status          = COALESCE($8,  status),
         start_date      = COALESCE($9,  start_date),
         deadline        = COALESCE($10, deadline),
         updated_at      = NOW()
       WHERE id = $11
       RETURNING *`, [
            dto.title ?? null,
            dto.description ?? null,
            dto.district ?? null,
            dto.budgetMin ?? null,
            dto.budgetMax ?? null,
            dto.requiredSkills ?? null,
            dto.profession ?? null,
            dto.status ?? null,
            dto.startDate ?? null,
            dto.deadline ?? null,
            jobId,
        ]);
        return this.formatJob(updated);
    }
    async deleteJob(userId, jobId) {
        const job = await this.db.queryOne('SELECT posted_by_id FROM jobs WHERE id = $1', [jobId]);
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.posted_by_id !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own jobs');
        }
        await this.db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
        return { message: 'Job deleted successfully' };
    }
    async saveJob(userId, jobId) {
        const job = await this.db.queryOne('SELECT id FROM jobs WHERE id = $1', [jobId]);
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        await this.db.query(`INSERT INTO saved_jobs (user_id, job_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, job_id) DO NOTHING`, [userId, jobId]);
        return { message: 'Job saved successfully' };
    }
    async unsaveJob(userId, jobId) {
        await this.db.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
        return { message: 'Job removed from saved list' };
    }
    async getSavedJobs(userId) {
        const jobs = await this.db.queryMany(`SELECT
         j.id, j.title, j.description, j.district,
         j.budget_min, j.budget_max, j.required_skills,
         j.profession, j.status, j.deadline, j.created_at,
         sj.created_at AS saved_at
       FROM saved_jobs sj
       JOIN jobs j ON j.id = sj.job_id
       WHERE sj.user_id = $1
       ORDER BY sj.created_at DESC`, [userId]);
        return jobs.map((j) => this.formatJob(j));
    }
    formatJob(job) {
        return {
            id: job.id,
            title: job.title,
            description: job.description,
            district: job.district,
            budgetMin: job.budget_min,
            budgetMax: job.budget_max,
            requiredSkills: job.required_skills,
            profession: job.profession,
            status: job.status,
            startDate: job.start_date,
            deadline: job.deadline,
            createdAt: job.created_at,
        };
    }
    formatJobWithPoster(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            district: row.district,
            budgetMin: row.budget_min,
            budgetMax: row.budget_max,
            requiredSkills: row.required_skills,
            profession: row.profession,
            status: row.status,
            startDate: row.start_date,
            deadline: row.deadline,
            createdAt: row.created_at,
            applicationCount: row.application_count
                ? parseInt(row.application_count, 10)
                : 0,
            postedBy: {
                id: row.poster_id,
                firstName: row.poster_first_name,
                lastName: row.poster_last_name,
                profilePhoto: row.poster_photo,
                isVerified: row.poster_verified,
                district: row.poster_district,
            },
        };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map