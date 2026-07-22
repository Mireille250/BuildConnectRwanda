import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_photo: string | null;
  bio: string | null;
  phone: string | null;
  district: string | null;
  is_verified: boolean;
  created_at: Date;
}

interface ProfileRow {
  id: string;
  user_id: string;
  profession: string | null;
  skills: string[];
  experience: number | null;
  availability: boolean;
  portfolio_url: string | null;
  linkedin_url: string | null;
  rating: number | null;
  rating_count: number;
  license_number: string | null;
  institution: string | null;
  graduation_year: number | null;
  company_name: string | null;
  registration_no: string | null;
  website: string | null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

 constructor(
  private readonly db: DatabaseService,
  private readonly cloudinaryService: CloudinaryService,
) {}

  // ─── Get Own Full Profile ──────────────────────────────────────────────────

  async getMyProfile(userId: string) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT id, email, first_name, last_name, role, profile_photo,
              bio, phone, district, is_verified, created_at
       FROM users WHERE id = $1`,
      [userId],
    );

    if (!user) throw new NotFoundException('User not found');

    const profile = await this.db.queryOne<ProfileRow>(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [userId],
    );

    return this.formatProfile(user, profile);
  }

  // ─── Get Public Profile by ID ──────────────────────────────────────────────

  async getPublicProfile(targetId: string) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT id, email, first_name, last_name, role, profile_photo,
              bio, phone, district, is_verified, created_at
       FROM users WHERE id = $1 AND is_active = true`,
      [targetId],
    );

    if (!user) throw new NotFoundException('User not found');

    const profile = await this.db.queryOne<ProfileRow>(
      `SELECT profession, skills, experience, availability,
              portfolio_url, linkedin_url, rating, rating_count,
              license_number, institution, graduation_year,
              company_name, registration_no, website
       FROM profiles WHERE user_id = $1`,
      [targetId],
    );
    

    // Get recent reviews for this user
    const reviews = await this.db.queryMany(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.first_name, u.last_name, u.profile_photo
       FROM reviews r
       JOIN users u ON u.id = r.author_id
       WHERE r.target_id = $1
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [targetId],
    );

    // Get portfolio projects
    const projects = await this.db.queryMany(
      `SELECT p.id, p.title, p.description, p.images, p.completed_at
       FROM projects p
       JOIN profiles pr ON pr.id = p.profile_id
       WHERE pr.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 6`,
      [targetId],
    );

    return {
      ...this.formatProfile(user, profile),
      reviews,
      projects,
    };
  }

  // ─── Update Profile ────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Update users table fields
    if (
      dto.firstName ||
      dto.lastName ||
      dto.phone ||
      dto.district ||
      dto.bio
    ) {
      await this.db.query(
        `UPDATE users SET
           first_name   = COALESCE($1, first_name),
           last_name    = COALESCE($2, last_name),
           phone        = COALESCE($3, phone),
           district     = COALESCE($4, district),
           bio          = COALESCE($5, bio),
           updated_at   = NOW()
         WHERE id = $6`,
        [
          dto.firstName ?? null,
          dto.lastName ?? null,
          dto.phone ?? null,
          dto.district ?? null,
          dto.bio ?? null,
          userId,
        ],
      );
    }

    // Update profiles table fields
    await this.db.query(
      `UPDATE profiles SET
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
       WHERE user_id = $13`,
      [
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
      ],
    );

    this.logger.log(`Profile updated for user: ${userId}`);
    return this.getMyProfile(userId);
  }
async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
  if (!file) throw new BadRequestException('No file provided');

  const result = await this.cloudinaryService.uploadFile(
    file.buffer,
    'buildconnect/profiles',
    'image',
  );

  await this.db.query(
    'UPDATE users SET profile_photo = $1, updated_at = NOW() WHERE id = $2',
    [result.secure_url, userId],
  );

  return { profilePhoto: result.secure_url };
}
  // ─── Change Password ───────────────────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.db.queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId],
    );

    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);

    await this.db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, userId],
    );

    // Invalidate all refresh tokens — forces re-login on other devices
    await this.db.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId],
    );

    return { message: 'Password changed successfully. Please login again.' };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private formatProfile(user: UserRow, profile: ProfileRow | null) {
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
}