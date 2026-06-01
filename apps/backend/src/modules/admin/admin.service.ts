import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly db: DatabaseService) {}

  // ─── Platform Statistics ───────────────────────────────────────────────────

  async getStats() {
    const [
      userStats,
      jobStats,
      applicationStats,
      reviewStats,
      verificationStats,
    ] = await Promise.all([
      // User counts by role
      this.db.queryMany(
        `SELECT role, COUNT(*) as count,
           SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified_count,
           SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count
         FROM users
         GROUP BY role
         ORDER BY role`,
        [],
      ),

      // Job counts by status
      this.db.queryMany(
        `SELECT status, COUNT(*) as count FROM jobs GROUP BY status`,
        [],
      ),

      // Application counts by status
      this.db.queryMany(
        `SELECT status, COUNT(*) as count FROM applications GROUP BY status`,
        [],
      ),

      // Review stats
      this.db.queryOne<{ total: string; avg_rating: string }>(
        `SELECT COUNT(*) as total,
           ROUND(AVG(rating)::numeric, 2) as avg_rating
         FROM reviews`,
        [],
      ),

      // Verification stats
      this.db.queryMany(
        `SELECT status, COUNT(*) as count FROM verification_docs GROUP BY status`,
        [],
      ),
    ]);

    // Total users
    const totalUsers = userStats.reduce(
      (sum, r) => sum + parseInt(r.count as string, 10),
      0,
    );

    return {
      users: {
        total: totalUsers,
        byRole: userStats.map((r) => ({
          role: r.role,
          count: parseInt(r.count as string, 10),
          verifiedCount: parseInt(r.verified_count as string, 10),
          activeCount: parseInt(r.active_count as string, 10),
        })),
      },
      jobs: {
        byStatus: jobStats.map((r) => ({
          status: r.status,
          count: parseInt(r.count as string, 10),
        })),
        total: jobStats.reduce(
          (sum, r) => sum + parseInt(r.count as string, 10),
          0,
        ),
      },
      applications: {
        byStatus: applicationStats.map((r) => ({
          status: r.status,
          count: parseInt(r.count as string, 10),
        })),
        total: applicationStats.reduce(
          (sum, r) => sum + parseInt(r.count as string, 10),
          0,
        ),
      },
      reviews: {
        total: parseInt(reviewStats?.total ?? '0', 10),
        averageRating: parseFloat(reviewStats?.avg_rating ?? '0'),
      },
      verification: {
        byStatus: verificationStats.map((r) => ({
          status: r.status,
          count: parseInt(r.count as string, 10),
        })),
      },
    };
  }

  // ─── List All Users ────────────────────────────────────────────────────────

  async getUsers(
    page = 1,
    limit = 20,
    role?: string,
    search?: string,
    isActive?: boolean,
    isVerified?: boolean,
  ) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (role) {
      conditions.push(`u.role = $${i}`);
      params.push(role);
      i++;
    }

    if (search) {
      conditions.push(
        `(u.first_name ILIKE $${i} OR u.last_name ILIKE $${i} OR u.email ILIKE $${i})`,
      );
      params.push(`%${search}%`);
      i++;
    }

    if (isActive !== undefined) {
      conditions.push(`u.is_active = $${i}`);
      params.push(isActive);
      i++;
    }

    if (isVerified !== undefined) {
      conditions.push(`u.is_verified = $${i}`);
      params.push(isVerified);
      i++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const offset = (page - 1) * limit;

    const [users, countResult] = await Promise.all([
      this.db.queryMany(
        `SELECT
           u.id, u.email, u.first_name, u.last_name,
           u.role, u.district, u.is_verified, u.is_active,
           u.created_at,
           p.profession, p.rating, p.rating_count,
           (SELECT COUNT(*) FROM applications a WHERE a.applicant_id = u.id) AS application_count,
           (SELECT COUNT(*) FROM jobs j WHERE j.posted_by_id = u.id) AS job_count
         FROM users u
         LEFT JOIN profiles p ON p.user_id = u.id
         ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset],
      ),
      this.db.queryOne<{ total: string }>(
        `SELECT COUNT(*) as total FROM users u ${whereClause}`,
        params,
      ),
    ]);

    const total = parseInt(countResult?.total ?? '0', 10);

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        district: u.district,
        isVerified: u.is_verified,
        isActive: u.is_active,
        createdAt: u.created_at,
        profession: u.profession,
        rating: u.rating ? parseFloat(u.rating as string) : 0,
        ratingCount: u.rating_count,
        applicationCount: parseInt(u.application_count as string, 10),
        jobCount: parseInt(u.job_count as string, 10),
      })),
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

  // ─── Get Single User Detail ────────────────────────────────────────────────

  async getUserDetail(userId: string) {
    const user = await this.db.queryOne(
      `SELECT
         u.*,
         p.profession, p.skills, p.experience,
         p.rating, p.rating_count, p.availability
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId],
    );

    if (!user) throw new NotFoundException('User not found');

    const [verificationDocs, recentJobs, recentApplications] =
      await Promise.all([
        this.db.queryMany(
          `SELECT id, doc_type, status, created_at, reviewed_at
           FROM verification_docs WHERE user_id = $1
           ORDER BY created_at DESC`,
          [userId],
        ),
        this.db.queryMany(
          `SELECT id, title, status, created_at FROM jobs
           WHERE posted_by_id = $1
           ORDER BY created_at DESC LIMIT 5`,
          [userId],
        ),
        this.db.queryMany(
          `SELECT a.id, a.status, a.created_at, j.title AS job_title
           FROM applications a
           JOIN jobs j ON j.id = a.job_id
           WHERE a.applicant_id = $1
           ORDER BY a.created_at DESC LIMIT 5`,
          [userId],
        ),
      ]);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone,
      district: user.district,
      isVerified: user.is_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
      profile: {
        profession: user.profession,
        skills: user.skills,
        experience: user.experience,
        rating: user.rating,
        ratingCount: user.rating_count,
      },
      verificationDocs,
      recentJobs,
      recentApplications,
    };
  }

  // ─── Toggle User Active Status ─────────────────────────────────────────────

  async toggleUserStatus(adminId: string, userId: string, isActive: boolean) {
    // Prevent admin from deactivating themselves
    if (adminId === userId) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    const user = await this.db.queryOne<{ id: string; role: string }>(
      'SELECT id, role FROM users WHERE id = $1',
      [userId],
    );

    if (!user) throw new NotFoundException('User not found');

    // Prevent deactivating other admins
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot deactivate another admin account');
    }

    await this.db.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, userId],
    );

    this.logger.log(
      `User ${userId} ${isActive ? 'activated' : 'deactivated'} by admin ${adminId}`,
    );

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      userId,
      isActive,
    };
  }

  // ─── List All Jobs ─────────────────────────────────────────────────────────

  async getJobs(page = 1, limit = 20, status?: string) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (status) {
      conditions.push(`j.status = $${i}`);
      params.push(status);
      i++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const offset = (page - 1) * limit;

    const [jobs, countResult] = await Promise.all([
      this.db.queryMany(
        `SELECT
           j.id, j.title, j.district, j.status,
           j.budget_min, j.budget_max, j.profession,
           j.created_at,
           u.first_name AS poster_first_name,
           u.last_name  AS poster_last_name,
           u.email      AS poster_email,
           (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
         FROM jobs j
         JOIN users u ON u.id = j.posted_by_id
         ${whereClause}
         ORDER BY j.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset],
      ),
      this.db.queryOne<{ total: string }>(
        `SELECT COUNT(*) as total FROM jobs j ${whereClause}`,
        params,
      ),
    ]);

    const total = parseInt(countResult?.total ?? '0', 10);

    return {
      data: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        district: j.district,
        status: j.status,
        budgetMin: j.budget_min,
        budgetMax: j.budget_max,
        profession: j.profession,
        createdAt: j.created_at,
        applicationCount: parseInt(j.application_count as string, 10),
        postedBy: {
          firstName: j.poster_first_name,
          lastName: j.poster_last_name,
          email: j.poster_email,
        },
      })),
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

  // ─── Delete Job ────────────────────────────────────────────────────────────

  async deleteJob(adminId: string, jobId: string) {
    const job = await this.db.queryOne<{ id: string; title: string }>(
      'SELECT id, title FROM jobs WHERE id = $1',
      [jobId],
    );

    if (!job) throw new NotFoundException('Job not found');

    await this.db.query('DELETE FROM jobs WHERE id = $1', [jobId]);

    this.logger.log(`Job ${jobId} deleted by admin ${adminId}`);

    return { message: 'Job removed successfully', jobId };
  }

  // ─── Recent Activity ───────────────────────────────────────────────────────

  async getRecentActivity() {
    const [recentUsers, recentJobs, recentApplications, recentReviews] =
      await Promise.all([
        this.db.queryMany(
          `SELECT id, email, first_name, last_name, role, created_at
           FROM users ORDER BY created_at DESC LIMIT 5`,
          [],
        ),
        this.db.queryMany(
          `SELECT j.id, j.title, j.district, j.status, j.created_at,
             u.first_name, u.last_name
           FROM jobs j
           JOIN users u ON u.id = j.posted_by_id
           ORDER BY j.created_at DESC LIMIT 5`,
          [],
        ),
        this.db.queryMany(
          `SELECT a.id, a.status, a.created_at,
             j.title AS job_title,
             u.first_name, u.last_name
           FROM applications a
           JOIN jobs j ON j.id = a.job_id
           JOIN users u ON u.id = a.applicant_id
           ORDER BY a.created_at DESC LIMIT 5`,
          [],
        ),
        this.db.queryMany(
          `SELECT r.id, r.rating, r.comment, r.created_at,
             u.first_name AS author_first_name,
             u.last_name  AS author_last_name,
             t.first_name AS target_first_name,
             t.last_name  AS target_last_name
           FROM reviews r
           JOIN users u ON u.id = r.author_id
           JOIN users t ON t.id = r.target_id
           ORDER BY r.created_at DESC LIMIT 5`,
          [],
        ),
      ]);

    return {
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        email: u.email,
        name: `${u.first_name} ${u.last_name}`,
        role: u.role,
        joinedAt: u.created_at,
      })),
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        title: j.title,
        district: j.district,
        status: j.status,
        postedBy: `${j.first_name} ${j.last_name}`,
        createdAt: j.created_at,
      })),
      recentApplications: recentApplications.map((a) => ({
        id: a.id,
        status: a.status,
        jobTitle: a.job_title,
        applicant: `${a.first_name} ${a.last_name}`,
        createdAt: a.created_at,
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        author: `${r.author_first_name} ${r.author_last_name}`,
        target: `${r.target_first_name} ${r.target_last_name}`,
        createdAt: r.created_at,
      })),
    };
  }
}
