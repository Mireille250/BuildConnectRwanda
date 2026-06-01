import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateApplicationDto } from './dto/create-application.dto';

interface ApplicationRow {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string | null;
  proposed_rate: number | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ─── Apply to a Job ────────────────────────────────────────────────────────

  async applyToJob(
    userId: string,
    jobId: string,
    dto: CreateApplicationDto,
  ) {
    // 1. Check job exists and is open
    const job = await this.db.queryOne<{
      id: string;
      status: string;
      posted_by_id: string;
    }>(
      'SELECT id, status, posted_by_id FROM jobs WHERE id = $1',
      [jobId],
    );

    if (!job) throw new NotFoundException('Job not found');

    if (job.status !== 'OPEN') {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    // 2. Cannot apply to your own job
    if (job.posted_by_id === userId) {
      throw new ForbiddenException('You cannot apply to your own job');
    }

    // 3. Check for duplicate application
    const existing = await this.db.queryOne(
      'SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [jobId, userId],
    );

    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    // 4. Create application
    const application = await this.db.queryOne<ApplicationRow>(
      `INSERT INTO applications (job_id, applicant_id, cover_letter, proposed_rate)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [jobId, userId, dto.coverLetter ?? null, dto.proposedRate ?? null],
    );

    this.logger.log(`User ${userId} applied to job ${jobId}`);
    return this.formatApplication(application!);
  }

  // ─── Get My Applications ───────────────────────────────────────────────────

  async getMyApplications(userId: string) {
    const applications = await this.db.queryMany(
      `SELECT
         a.id, a.status, a.cover_letter, a.proposed_rate, a.created_at,
         j.id          AS job_id,
         j.title       AS job_title,
         j.district    AS job_district,
         j.budget_min  AS job_budget_min,
         j.budget_max  AS job_budget_max,
         j.status      AS job_status,
         j.deadline    AS job_deadline,
         u.first_name  AS poster_first_name,
         u.last_name   AS poster_last_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = j.posted_by_id
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [userId],
    );

    return applications.map((a) => ({
      id: a.id,
      status: a.status,
      coverLetter: a.cover_letter,
      proposedRate: a.proposed_rate,
      createdAt: a.created_at,
      job: {
        id: a.job_id,
        title: a.job_title,
        district: a.job_district,
        budgetMin: a.job_budget_min,
        budgetMax: a.job_budget_max,
        status: a.job_status,
        deadline: a.job_deadline,
        postedBy: `${a.poster_first_name} ${a.poster_last_name}`,
      },
    }));
  }

  // ─── Get Applicants for a Job (CLIENT view) ────────────────────────────────

  async getJobApplicants(userId: string, jobId: string) {
    // Verify the requester owns this job
    const job = await this.db.queryOne<{ posted_by_id: string; title: string }>(
      'SELECT posted_by_id, title FROM jobs WHERE id = $1',
      [jobId],
    );

    if (!job) throw new NotFoundException('Job not found');

    if (job.posted_by_id !== userId) {
      throw new ForbiddenException('You can only view applicants for your own jobs');
    }

    const applicants = await this.db.queryMany(
      `SELECT
         a.id, a.status, a.cover_letter, a.proposed_rate, a.created_at,
         u.id           AS applicant_id,
         u.first_name   AS first_name,
         u.last_name    AS last_name,
         u.profile_photo,
         u.district,
         u.is_verified,
         p.profession,
         p.skills,
         p.experience,
         p.rating,
         p.rating_count
       FROM applications a
       JOIN users u ON u.id = a.applicant_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.created_at ASC`,
      [jobId],
    );

    return {
      jobTitle: job.title,
      totalApplicants: applicants.length,
      applicants: applicants.map((a) => ({
        applicationId: a.id,
        status: a.status,
        coverLetter: a.cover_letter,
        proposedRate: a.proposed_rate,
        appliedAt: a.created_at,
        applicant: {
          id: a.applicant_id,
          firstName: a.first_name,
          lastName: a.last_name,
          profilePhoto: a.profile_photo,
          district: a.district,
          isVerified: a.is_verified,
          profession: a.profession,
          skills: a.skills,
          experience: a.experience,
          rating: a.rating ? parseFloat(a.rating as string) : 0,
          ratingCount: a.rating_count,
        },
      })),
    };
  }

  // ─── Accept Application ────────────────────────────────────────────────────

  async acceptApplication(userId: string, applicationId: string) {
    const application = await this.db.queryOne<ApplicationRow & {
      posted_by_id: string;
      job_status: string;
    }>(
      `SELECT a.*, j.posted_by_id, j.status AS job_status
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1`,
      [applicationId],
    );

    if (!application) throw new NotFoundException('Application not found');

    if (application.posted_by_id !== userId) {
      throw new ForbiddenException('You can only manage applications for your own jobs');
    }

    if (application.job_status !== 'OPEN') {
      throw new BadRequestException('This job is no longer open');
    }

    // Use transaction: accept application + update job status together
    await this.db.transaction(async (client) => {
      await client.query(
        `UPDATE applications SET status = 'ACCEPTED', updated_at = NOW()
         WHERE id = $1`,
        [applicationId],
      );

      await client.query(
        `UPDATE jobs SET status = 'IN_PROGRESS', updated_at = NOW()
         WHERE id = $1`,
        [application.job_id],
      );

      // Reject all other pending applications for this job
      await client.query(
        `UPDATE applications SET status = 'REJECTED', updated_at = NOW()
         WHERE job_id = $1 AND id != $2 AND status = 'PENDING'`,
        [application.job_id, applicationId],
      );
    });

    this.logger.log(`Application ${applicationId} accepted for job ${application.job_id}`);
    return { message: 'Application accepted. Job is now in progress.' };
  }

  // ─── Reject Application ────────────────────────────────────────────────────

  async rejectApplication(userId: string, applicationId: string) {
    const application = await this.db.queryOne<ApplicationRow & {
      posted_by_id: string;
    }>(
      `SELECT a.*, j.posted_by_id
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1`,
      [applicationId],
    );

    if (!application) throw new NotFoundException('Application not found');

    if (application.posted_by_id !== userId) {
      throw new ForbiddenException('You can only manage applications for your own jobs');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Only pending applications can be rejected');
    }

    await this.db.query(
      `UPDATE applications SET status = 'REJECTED', updated_at = NOW()
       WHERE id = $1`,
      [applicationId],
    );

    return { message: 'Application rejected' };
  }

  // ─── Withdraw Application ──────────────────────────────────────────────────

  async withdrawApplication(userId: string, applicationId: string) {
    const application = await this.db.queryOne<ApplicationRow>(
      'SELECT * FROM applications WHERE id = $1',
      [applicationId],
    );

    if (!application) throw new NotFoundException('Application not found');

    if (application.applicant_id !== userId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Only pending applications can be withdrawn');
    }

    await this.db.query(
      `UPDATE applications SET status = 'WITHDRAWN', updated_at = NOW()
       WHERE id = $1`,
      [applicationId],
    );

    return { message: 'Application withdrawn successfully' };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private formatApplication(app: ApplicationRow) {
    return {
      id: app.id,
      jobId: app.job_id,
      applicantId: app.applicant_id,
      coverLetter: app.cover_letter,
      proposedRate: app.proposed_rate,
      status: app.status,
      createdAt: app.created_at,
    };
  }
}