import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  profile_photo: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [dto.email.toLowerCase()],
    );

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.db.transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users
           (email, password_hash, first_name, last_name, role, phone, district)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, first_name, last_name, role, is_verified, profile_photo`,
        [
          dto.email.toLowerCase(),
          passwordHash,
          dto.firstName,
          dto.lastName,
          dto.role,
          dto.phone ?? null,
          dto.district ?? null,
        ],
      );

      const newUser = userResult.rows[0];

      await client.query(
        `INSERT INTO profiles (user_id) VALUES ($1)`,
        [newUser.id],
      );

      return newUser;
    });

    this.logger.log(`New user registered: ${user.email} (${user.role})`);
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT id, email, password_hash, first_name, last_name,
              role, is_verified, is_active, profile_photo
       FROM users WHERE email = $1`,
      [dto.email.toLowerCase()],
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    this.logger.log(`User logged in: ${user.email}`);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.db.queryOne<{ user_id: string; expires_at: Date }>(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
      [refreshToken],
    );

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > new Date(stored.expires_at)) {
      await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      throw new UnauthorizedException('Refresh token expired, please login again');
    }

    const user = await this.db.queryOne<UserRow>(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [stored.user_id],
    );

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or account disabled');
    }

    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string) {
    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT id, email, first_name, last_name, role,
              is_verified, profile_photo, bio, phone, district, created_at
       FROM users WHERE id = $1`,
      [userId],
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

 private async generateTokens(userId: string, email: string, role: string) {
  const payload = { sub: userId, email, role };

  const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET')!;
  const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET')!;

  // Use number of seconds instead of string to avoid StringValue type issues
  const ACCESS_TOKEN_TTL  = 60 * 15;        // 15 minutes in seconds
  const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

  const [accessToken, refreshToken] = await Promise.all([
    this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: ACCESS_TOKEN_TTL,
    }),
    this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: REFRESH_TOKEN_TTL,
    }),
  ]);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await this.db.query(
    `INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)`,
    [refreshToken, userId, expiresAt],
  );

  return { accessToken, refreshToken };
}

  private sanitizeUser(user: Partial<UserRow>) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isVerified: user.is_verified,
      profilePhoto: user.profile_photo ?? null,
    };
  }
}