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
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    db;
    logger = new common_1.Logger(ReviewsService_1.name);
    constructor(db) {
        this.db = db;
    }
    async createReview(authorId, dto) {
        if (authorId === dto.targetId) {
            throw new common_1.BadRequestException('You cannot review yourself');
        }
        const job = await this.db.queryOne('SELECT id, posted_by_id, status FROM jobs WHERE id = $1', [dto.jobId]);
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.posted_by_id !== authorId) {
            throw new common_1.ForbiddenException('You can only review professionals from your own jobs');
        }
        const application = await this.db.queryOne(`SELECT id, status FROM applications
       WHERE job_id = $1 AND applicant_id = $2 AND status = 'ACCEPTED'`, [dto.jobId, dto.targetId]);
        if (!application) {
            throw new common_1.ForbiddenException('You can only review professionals you have hired for a job');
        }
        const existing = await this.db.queryOne('SELECT id FROM reviews WHERE author_id = $1 AND job_id = $2', [authorId, dto.jobId]);
        if (existing) {
            throw new common_1.ConflictException('You have already reviewed this professional for this job');
        }
        const review = await this.db.transaction(async (client) => {
            const result = await client.query(`INSERT INTO reviews (author_id, target_id, rating, comment, job_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, rating, comment, created_at`, [authorId, dto.targetId, dto.rating, dto.comment ?? null, dto.jobId]);
            const newReview = result.rows[0];
            await client.query(`UPDATE profiles SET
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
         WHERE user_id = $1`, [dto.targetId]);
            return newReview;
        });
        this.logger.log(`Review created by ${authorId} for ${dto.targetId} — rating: ${dto.rating}/5`);
        return {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.created_at,
            targetId: dto.targetId,
            jobId: dto.jobId,
        };
    }
    async getUserReviews(targetId, page = 1, limit = 10) {
        const user = await this.db.queryOne('SELECT first_name, last_name FROM users WHERE id = $1', [targetId]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const offset = (page - 1) * limit;
        const [reviews, countResult, ratingResult] = await Promise.all([
            this.db.queryMany(`SELECT
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
         LIMIT $2 OFFSET $3`, [targetId, limit, offset]),
            this.db.queryOne('SELECT COUNT(*) as total FROM reviews WHERE target_id = $1', [targetId]),
            this.db.queryOne('SELECT ROUND(AVG(rating)::numeric, 2) as avg_rating FROM reviews WHERE target_id = $1', [targetId]),
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
    async getMyReviews(userId, page = 1, limit = 10) {
        return this.getUserReviews(userId, page, limit);
    }
    async getReviewsIWrote(authorId) {
        const reviews = await this.db.queryMany(`SELECT
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
       ORDER BY r.created_at DESC`, [authorId]);
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map