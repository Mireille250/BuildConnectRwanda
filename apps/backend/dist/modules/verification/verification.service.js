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
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const cloudinary_service_1 = require("../../common/cloudinary/cloudinary.service");
const ALLOWED_DOC_TYPES = [
    'degree',
    'certificate',
    'license',
    'national_id',
    'company_registration',
];
let VerificationService = VerificationService_1 = class VerificationService {
    db;
    cloudinary;
    logger = new common_1.Logger(VerificationService_1.name);
    constructor(db, cloudinary) {
        this.db = db;
        this.cloudinary = cloudinary;
    }
    async uploadDocument(userId, file, docType) {
        if (!ALLOWED_DOC_TYPES.includes(docType)) {
            throw new common_1.BadRequestException(`Invalid document type. Allowed: ${ALLOWED_DOC_TYPES.join(', ')}`);
        }
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const uploaded = await this.cloudinary.uploadFile(file.buffer, `buildconnect/verification/${userId}`, 'auto');
        const doc = await this.db.queryOne(`INSERT INTO verification_docs (user_id, doc_type, file_url, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`, [userId, docType, uploaded.secure_url]);
        this.logger.log(`Document uploaded by user ${userId}: ${docType}`);
        return this.formatDoc(doc);
    }
    async getMyDocuments(userId) {
        const docs = await this.db.queryMany(`SELECT * FROM verification_docs
       WHERE user_id = $1
       ORDER BY created_at DESC`, [userId]);
        return docs.map((d) => this.formatDoc(d));
    }
    async getPendingDocuments(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [docs, countResult] = await Promise.all([
            this.db.queryMany(`SELECT
           vd.*,
           u.first_name, u.last_name, u.email,
           u.role, u.district
         FROM verification_docs vd
         JOIN users u ON u.id = vd.user_id
         WHERE vd.status = 'PENDING'
         ORDER BY vd.created_at ASC
         LIMIT $1 OFFSET $2`, [limit, offset]),
            this.db.queryOne(`SELECT COUNT(*) as total FROM verification_docs WHERE status = 'PENDING'`, []),
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
    async reviewDocument(adminId, documentId, dto) {
        const doc = await this.db.queryOne('SELECT * FROM verification_docs WHERE id = $1', [documentId]);
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        if (doc.status !== 'PENDING') {
            throw new common_1.BadRequestException('This document has already been reviewed');
        }
        await this.db.query(`UPDATE verification_docs SET
         status      = $1,
         admin_note  = $2,
         reviewed_at = NOW(),
         updated_at  = NOW()
       WHERE id = $3`, [dto.decision, dto.adminNote ?? null, documentId]);
        if (dto.decision === 'APPROVED') {
            await this.checkAndVerifyUser(doc.user_id);
        }
        this.logger.log(`Document ${documentId} ${dto.decision} by admin ${adminId}`);
        return {
            message: `Document ${dto.decision.toLowerCase()} successfully`,
            documentId,
            decision: dto.decision,
        };
    }
    async getUserDocuments(targetUserId) {
        const user = await this.db.queryOne('SELECT first_name, last_name, email, is_verified FROM users WHERE id = $1', [targetUserId]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const docs = await this.db.queryMany('SELECT * FROM verification_docs WHERE user_id = $1 ORDER BY created_at DESC', [targetUserId]);
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
    async checkAndVerifyUser(userId) {
        const approvedCount = await this.db.queryOne(`SELECT COUNT(*) as count FROM verification_docs
       WHERE user_id = $1 AND status = 'APPROVED'`, [userId]);
        if (parseInt(approvedCount?.count ?? '0', 10) >= 1) {
            await this.db.query('UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1', [userId]);
            this.logger.log(`User ${userId} is now verified`);
        }
    }
    formatDoc(doc) {
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
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        cloudinary_service_1.CloudinaryService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map