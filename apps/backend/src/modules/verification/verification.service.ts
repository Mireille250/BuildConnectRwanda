import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { ReviewDocumentDto } from './dto/review-document.dto';

interface VerificationDocRow {
  id: string;
  user_id: string;
  doc_type: string;
  file_url: string;
  status: string;
  admin_note: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}

const ALLOWED_DOC_TYPES = [
  'degree',
  'certificate',
  'license',
  'national_id',
  'company_registration',
];

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ─── Upload Document ───────────────────────────────────────────────────────

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    docType: string,
  ) {
    if (!ALLOWED_DOC_TYPES.includes(docType)) {
      throw new BadRequestException(
        `Invalid document type. Allowed: ${ALLOWED_DOC_TYPES.join(', ')}`,
      );
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to Cloudinary under buildconnect/verification folder
    const uploaded = await this.cloudinary.uploadFile(
      file.buffer,
      `buildconnect/verification/${userId}`,
      'auto',
    );

    // Save document record in database
    const doc = await this.db.queryOne<VerificationDocRow>(
      `INSERT INTO verification_docs (user_id, doc_type, file_url, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`,
      [userId, docType, uploaded.secure_url],
    );

    this.logger.log(`Document uploaded by user ${userId}: ${docType}`);

    return this.formatDoc(doc!);
  }

  // ─── Get My Documents ──────────────────────────────────────────────────────

  async getMyDocuments(userId: string) {
    const docs = await this.db.queryMany<VerificationDocRow>(
      `SELECT * FROM verification_docs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return docs.map((d) => this.formatDoc(d));
  }

  // ─── Get Pending Documents (Admin) ────────────────────────────────────────

  async getPendingDocuments(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [docs, countResult] = await Promise.all([
      this.db.queryMany(
        `SELECT
           vd.*,
           u.first_name, u.last_name, u.email,
           u.role, u.district
         FROM verification_docs vd
         JOIN users u ON u.id = vd.user_id
         WHERE vd.status = 'PENDING'
         ORDER BY vd.created_at ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.queryOne<{ total: string }>(
        `SELECT COUNT(*) as total FROM verification_docs WHERE status = 'PENDING'`,
        [],
      ),
    ]);

    const total = parseInt(countResult?.total ?? '0', 10);

    return {
      data: docs.map((d) => ({
        id: d.id,
        docType: d.doc_type,
        fileUrl: d.file_url,
        status: d.status,
        createdAt: d.created_at,
        user: {
          id: d.user_id,
          firstName: d.first_name,
          lastName: d.last_name,
          email: d.email,
          role: d.role,
          district: d.district,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Approve or Reject Document (Admin) ───────────────────────────────────

  async reviewDocument(
    adminId: string,
    documentId: string,
    dto: ReviewDocumentDto,
  ) {
    const doc = await this.db.queryOne<VerificationDocRow>(
      'SELECT * FROM verification_docs WHERE id = $1',
      [documentId],
    );

    if (!doc) throw new NotFoundException('Document not found');

    if (doc.status !== 'PENDING') {
      throw new BadRequestException('This document has already been reviewed');
    }

    // Update document status
    await this.db.query(
      `UPDATE verification_docs SET
         status      = $1,
         admin_note  = $2,
         reviewed_at = NOW(),
         updated_at  = NOW()
       WHERE id = $3`,
      [dto.decision, dto.adminNote ?? null, documentId],
    );

    // If approved — check if all docs are approved and mark user as verified
    if (dto.decision === 'APPROVED') {
      await this.checkAndVerifyUser(doc.user_id);
    }

    this.logger.log(
      `Document ${documentId} ${dto.decision} by admin ${adminId}`,
    );

    return {
      message: `Document ${dto.decision.toLowerCase()} successfully`,
      documentId,
      decision: dto.decision,
    };
  }

  // ─── Get All Documents for a User (Admin) ─────────────────────────────────

  async getUserDocuments(targetUserId: string) {
    const user = await this.db.queryOne<{
      first_name: string;
      last_name: string;
      email: string;
      is_verified: boolean;
    }>(
      'SELECT first_name, last_name, email, is_verified FROM users WHERE id = $1',
      [targetUserId],
    );

    if (!user) throw new NotFoundException('User not found');

    const docs = await this.db.queryMany<VerificationDocRow>(
      'SELECT * FROM verification_docs WHERE user_id = $1 ORDER BY created_at DESC',
      [targetUserId],
    );

    return {
      user: {
        id: targetUserId,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isVerified: user.is_verified,
      },
      documents: docs.map((d) => this.formatDoc(d)),
    };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * After approving a document, check if the user has at least
   * one approved document. If so, mark them as verified.
   */
  private async checkAndVerifyUser(userId: string) {
    const approvedCount = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM verification_docs
       WHERE user_id = $1 AND status = 'APPROVED'`,
      [userId],
    );

    if (parseInt(approvedCount?.count ?? '0', 10) >= 1) {
      await this.db.query(
        'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1',
        [userId],
      );
      this.logger.log(`User ${userId} is now verified`);
    }
  }

  private formatDoc(doc: VerificationDocRow) {
    return {
      id: doc.id,
      docType: doc.doc_type,
      fileUrl: doc.file_url,
      status: doc.status,
      adminNote: doc.admin_note,
      reviewedAt: doc.reviewed_at,
      createdAt: doc.created_at,
    };
  }
}