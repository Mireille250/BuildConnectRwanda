import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ─── Create Review ─────────────────────────────────────────────────────────

  async createReview(authorId: string, dto: CreateReviewDto) {
    // 1. Cannot review yourself
    if (authorId === dto.targetId) {
      throw new BadRequestException('You cannot review yourself');
    }

    // 2. Verify the job exists and was posted by this client
    const job = await this.db.queryOne<{
      id: string;
      posted_by_id: string;
      status: string;
    }>(
      'SELECT id, posted_by_id, status FROM jobs WHERE id = $1',
      [dto.jobId],
    );

    if (!job) throw new NotFoundException('Job not found');

    if (job.posted_by_id !== authorId) {
      throw new ForbiddenException('You can only review professionals from your own jobs');
    }

    // 3. Verify the target was actually hired for this job
    const application = await this.db.queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM applications
       WHERE job_id = $1 AND applicant_id = $2 AND status = 'ACCEPTED'`,
      [dto.jobId, dto.targetId],
    );

    if (!application) {
      throw new ForbiddenException(
        'You can only review professionals you have hired for a job',
      );
    }

    // 4. Check for duplicate review on this job
    const existing = await this.db.queryOne(
      'SELECT id FROM reviews WHERE author_id = $1 AND job_id = $2',
      [authorId, dto.jobId],
    );

    if (existing) {
      throw new ConflictException('You have already reviewed this professional for this job');
    }

    // 5. Save review and update rating in a transaction
    const review = await this.db.transaction(async (client) => {
      // Insert the review
      const result = await client.query(
        `INSERT INTO reviews (author_id, target_id, rating, comment, job_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, rating, comment, created_at`,
        [authorId, dto.targetId, dto.rating, dto.comment ?? null, dto.jobId],
      );

      const newReview = result.rows[0];

      // Recalculate average rating for the target user
      await client.query(
        `UPDATE profiles SET
           rating = (
             SELECT ROUND(AVG(rating)::numeric, 2)
             FROM reviews
             WHERE target_id = $1
           ),
           rating_count = (
             SELECT COUNT(*)
             FROM reviews
             WHERE target_id = $1
           ),
           updated_at = NOW()
         WHERE user_id = $1`,
        [dto.targetId],
      );

      return newReview;
    });

    this.logger.log(
      `Review created by ${authorId} for ${dto.targetId} — rating: ${dto.rating}/5`,
    );

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      targetId: dto.targetId,
      jobId: dto.jobId,
    };
  }

  // ─── Get Reviews for a User ────────────────────────────────────────────────

  async getUserReviews(targetId: string, page = 1, limit = 10) {
    // Check user exists
    const user = await this.db.queryOne<{
      first_name: string;
      last_name: string;
    }>(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [targetId],
    );

    if (!user) throw new NotFoundException('User not found');

    const offset = (page - 1) * limit;

    const [reviews, countResult, ratingResult] = await Promise.all([
      this.db.queryMany(
        `SELECT
           r.id, r.rating, r.comment, r.created_at,
           r.job_id,
           j.title AS job_title,
           u.id           AS author_id,
           u.first_name   AS author_first_name,
           u.last_name    AS author_last_name,
           u.profile_photo AS author_photo
         FROM reviews r
         JOIN users u ON u.id = r.author_id
         LEFT JOIN jobs j ON j.id = r.job_id
         WHERE r.target_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [targetId, limit, offset],
      ),
      this.db.queryOne<{ total: string }>(
        'SELECT COUNT(*) as total FROM reviews WHERE target_id = $1',
        [targetId],
      ),
      this.db.queryOne<{ avg_rating: string }>(
        'SELECT ROUND(AVG(rating)::numeric, 2) as avg_rating FROM reviews WHERE target_id = $1',
        [targetId],
      ),
    ]);

    const total = parseInt(countResult?.total ?? '0', 10);

    return {
      targetUser: {
        id: targetId,
        firstName: user.first_name,
        lastName: user.last_name,
        averageRating: parseFloat(ratingResult?.avg_rating ?? '0'),
        totalReviews: total,
      },
      data: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        jobId: r.job_id,
        jobTitle: r.job_title,
        author: {
          id: r.author_id,
          firstName: r.author_first_name,
          lastName: r.author_last_name,
          profilePhoto: r.author_photo,
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

  // ─── Get Reviews I Have Received ───────────────────────────────────────────

  async getMyReviews(userId: string, page = 1, limit = 10) {
    return this.getUserReviews(userId, page, limit);
  }

  // ─── Get Reviews I Have Written ────────────────────────────────────────────

  async getReviewsIWrote(authorId: string) {
    const reviews = await this.db.queryMany(
      `SELECT
         r.id, r.rating, r.comment, r.created_at,
         r.job_id,
         j.title AS job_title,
         u.id           AS target_id,
         u.first_name   AS target_first_name,
         u.last_name    AS target_last_name,
         u.profile_photo AS target_photo,
         p.profession
       FROM reviews r
       JOIN users u ON u.id = r.target_id
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN jobs j ON j.id = r.job_id
       WHERE r.author_id = $1
       ORDER BY r.created_at DESC`,
      [authorId],
    );

    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      jobId: r.job_id,
      jobTitle: r.job_title,
      professional: {
        id: r.target_id,
        firstName: r.target_first_name,
        lastName: r.target_last_name,
        profilePhoto: r.target_photo,
        profession: r.profession,
      },
    }));
  }
}