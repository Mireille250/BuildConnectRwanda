"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const database_service_1 = require("../../database/database.service");
let UsersService = UsersService_1 = class UsersService {
    db;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(db) {
        this.db = db;
    }
    async getMyProfile(userId) {
        const user = await this.db.queryOne(`SELECT id, email, first_name, last_name, role, profile_photo,
              bio, phone, district, is_verified, created_at
       FROM users WHERE id = $1`, [userId]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const profile = await this.db.queryOne(`SELECT * FROM profiles WHERE user_id = $1`, [userId]);
        return this.formatProfile(user, profile);
    }
    async getPublicProfile(targetId) {
        const user = await this.db.queryOne(`SELECT id, email, first_name, last_name, role, profile_photo,
              bio, phone, district, is_verified, created_at
       FROM users WHERE id = $1 AND is_active = true`, [targetId]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const profile = await this.db.queryOne(`SELECT profession, skills, experience, availability,
              portfolio_url, linkedin_url, rating, rating_count,
              license_number, institution, graduation_year,
              company_name, registration_no, website
       FROM profiles WHERE user_id = $1`, [targetId]);
        const reviews = await this.db.queryMany(`SELECT r.id, r.rating, r.comment, r.created_at,
              u.first_name, u.last_name, u.profile_photo
       FROM reviews r
       JOIN users u ON u.id = r.author_id
       WHERE r.target_id = $1
       ORDER BY r.created_at DESC
       LIMIT 5`, [targetId]);
        const projects = await this.db.queryMany(`SELECT p.id, p.title, p.description, p.images, p.completed_at
       FROM projects p
       JOIN profiles pr ON pr.id = p.profile_id
       WHERE pr.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 6`, [targetId]);
        return {
            ...this.formatProfile(user, profile),
            reviews,
            projects,
        };
    }
    async updateProfile(userId, dto) {
        if (dto.firstName ||
            dto.lastName ||
            dto.phone ||
            dto.district ||
            dto.bio) {
            await this.db.query(`UPDATE users SET
           first_name   = COALESCE($1, first_name),
           last_name    = COALESCE($2, last_name),
           phone        = COALESCE($3, phone),
           district     = COALESCE($4, district),
           bio          = COALESCE($5, bio),
           updated_at   = NOW()
         WHERE id = $6`, [
                dto.firstName ?? null,
                dto.lastName ?? null,
                dto.phone ?? null,
                dto.district ?? null,
                dto.bio ?? null,
                userId,
            ]);
        }
        await this.db.query(`UPDATE profiles SET
         profession      = COALESCE($1,  profession),
         skills          = COALESCE($2,  skills),
         experience      = COALESCE($3,  experience),
         availability    = COALESCE($4,  availability),
         portfolio_url   = COALESCE($5,  portfolio_url),
         linkedin_url    = COALESCE($6,  linkedin_url),
         license_number  = COALESCE($7,  license_number),
         institution     = COALESCE($8,  institution),
         graduation_year = COALESCE($9,  graduation_year),
         company_name    = COALESCE($10, company_name),
         registration_no = COALESCE($11, registration_no),
         website         = COALESCE($12, website),
         updated_at      = NOW()
       WHERE user_id = $13`, [
            dto.profession ?? null,
            dto.skills ?? null,
            dto.experience ?? null,
            dto.availability ?? null,
            dto.portfolioUrl ?? null,
            dto.linkedinUrl ?? null,
            dto.licenseNumber ?? null,
            dto.institution ?? null,
            dto.graduationYear ?? null,
            dto.companyName ?? null,
            dto.registrationNo ?? null,
            dto.website ?? null,
            userId,
        ]);
        this.logger.log(`Profile updated for user: ${userId}`);
        return this.getMyProfile(userId);
    }
    async changePassword(userId, dto) {
        const user = await this.db.queryOne('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(dto.currentPassword, user.password_hash);
        if (!valid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
        await this.db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
        return { message: 'Password changed successfully. Please login again.' };
    }
    formatProfile(user, profile) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            profilePhoto: user.profile_photo,
            bio: user.bio,
            phone: user.phone,
            district: user.district,
            isVerified: user.is_verified,
            createdAt: user.created_at,
            profile: profile
                ? {
                    profession: profile.profession,
                    skills: profile.skills,
                    experience: profile.experience,
                    availability: profile.availability,
                    portfolioUrl: profile.portfolio_url,
                    linkedinUrl: profile.linkedin_url,
                    rating: profile.rating,
                    ratingCount: profile.rating_count,
                    licenseNumber: profile.license_number,
                    institution: profile.institution,
                    graduationYear: profile.graduation_year,
                    companyName: profile.company_name,
                    registrationNo: profile.registration_no,
                    website: profile.website,
                }
                : null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map