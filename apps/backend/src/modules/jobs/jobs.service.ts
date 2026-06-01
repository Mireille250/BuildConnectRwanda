import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';

interface JobRow {
  id: string;
  title: string;
  description: string;
  district: string;
  budget_min: number | null;
  budget_max: number | null;
  required_skills: string[];
  profession: string | null;
  status: string;
  posted_by_id: string;
  start_date: Date | null;
  deadline: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ─── Create Job ────────────────────────────────────────────────────────────

  async createJob(userId: string, dto: CreateJobDto) {
    if (dto.budgetMin && dto.budgetMax && dto.budgetMin > dto.budgetMax) {
      throw new BadRequestException('budgetMin cannot be greater than budgetMax');
    }

    const job = await this.db.queryOne<JobRow>(
      `INSERT INTO jobs
         (title, description, district, budget_min, budget_max,
          required_skills, profession, posted_by_id, start_date, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
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
      ],
    );

    this.logger.log(`Job created: ${job!.title} by user ${userId}`);
    return this.formatJob(job!);
  }

  // ─── Search / Browse Jobs ──────────────────────────────────────────────────

  async searchJobs(dto: SearchJobsDto) {
    const {
      district,
      profession,
      skill,
      minBudget,
      maxBudget,
      status = 'OPEN',
      keyword,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = dto;

    const conditions: string[] = [];
    const params: unknown[] = [];
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
      conditions.push(
        `(j.title ILIKE $${i} OR j.description ILIKE $${i})`,
      );
      params.push(`%${keyword}%`);
      i++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort: Record<string, string> = {
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
      this.db.queryOne<{ total: string }>(countQuery, params),
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

  // ─── Get Single Job ────────────────────────────────────────────────────────

  async getJobById(jobId: string) {
    const job = await this.db.queryOne(
      `SELECT
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
       WHERE j.id = $1`,
      [jobId],
    );

    if (!job) throw new NotFoundException('Job not found');
    return this.formatJobWithPoster(job);
  }

  // ─── Get My Posted Jobs ────────────────────────────────────────────────────

  async getMyJobs(userId: string) {
    const jobs = await this.db.queryMany(
      `SELECT j.*,
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
       FROM jobs j
       WHERE j.posted_by_id = $1
       ORDER BY j.created_at DESC`,
      [userId],
    );

return jobs.map((j) => this.formatJob(j as unknown as JobRow));
  }

  // ─── Update Job ────────────────────────────────────────────────────────────

  async updateJob(userId: string, jobId: string, dto: UpdateJobDto) {
    const job = await this.db.queryOne<JobRow>(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId],
    );

    if (!job) throw new NotFoundException('Job not found');

    if (job.posted_by_id !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    const updated = await this.db.queryOne<JobRow>(
      `UPDATE jobs SET
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
       RETURNING *`,
      [
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
      ],
    );

    return this.formatJob(updated!);
  }

  // ─── Delete Job ────────────────────────────────────────────────────────────

  async deleteJob(userId: string, jobId: string) {
    const job = await this.db.queryOne<JobRow>(
      'SELECT posted_by_id FROM jobs WHERE id = $1',
      [jobId],
    );

    if (!job) throw new NotFoundException('Job not found');

    if (job.posted_by_id !== userId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    await this.db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
    return { message: 'Job deleted successfully' };
  }

  // ─── Save / Unsave Job ─────────────────────────────────────────────────────

  async saveJob(userId: string, jobId: string) {
    const job = await this.db.queryOne(
      'SELECT id FROM jobs WHERE id = $1',
      [jobId],
    );
    if (!job) throw new NotFoundException('Job not found');

    await this.db.query(
      `INSERT INTO saved_jobs (user_id, job_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, job_id) DO NOTHING`,
      [userId, jobId],
    );

    return { message: 'Job saved successfully' };
  }

  async unsaveJob(userId: string, jobId: string) {
    await this.db.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId],
    );
    return { message: 'Job removed from saved list' };
  }

  async getSavedJobs(userId: string) {
    const jobs = await this.db.queryMany(
      `SELECT
         j.id, j.title, j.description, j.district,
         j.budget_min, j.budget_max, j.required_skills,
         j.profession, j.status, j.deadline, j.created_at,
         sj.created_at AS saved_at
       FROM saved_jobs sj
       JOIN jobs j ON j.id = sj.job_id
       WHERE sj.user_id = $1
       ORDER BY sj.created_at DESC`,
      [userId],
    );

    return jobs.map((j) => this.formatJob(j as unknown as JobRow));
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private formatJob(job: JobRow) {
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

  private formatJobWithPoster(row: Record<string, unknown>) {
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
        ? parseInt(row.application_count as string, 10)
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
}