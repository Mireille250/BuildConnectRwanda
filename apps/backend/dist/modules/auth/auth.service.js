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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const database_service_1 = require("../../database/database.service");
let AuthService = AuthService_1 = class AuthService {
    db;
    jwt;
    config;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(db, jwt, config) {
        this.db = db;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.db.queryOne('SELECT id FROM users WHERE email = $1', [dto.email.toLowerCase()]);
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.db.transaction(async (client) => {
            const userResult = await client.query(`INSERT INTO users
           (email, password_hash, first_name, last_name, role, phone, district)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, first_name, last_name, role, is_verified, profile_photo`, [
                dto.email.toLowerCase(),
                passwordHash,
                dto.firstName,
                dto.lastName,
                dto.role,
                dto.phone ?? null,
                dto.district ?? null,
            ]);
            const newUser = userResult.rows[0];
            await client.query(`INSERT INTO profiles (user_id) VALUES ($1)`, [newUser.id]);
            return newUser;
        });
        this.logger.log(`New user registered: ${user.email} (${user.role})`);
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto) {
        const user = await this.db.queryOne(`SELECT id, email, password_hash, first_name, last_name,
              role, is_verified, is_active, profile_photo
       FROM users WHERE email = $1`, [dto.email.toLowerCase()]);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('Your account has been deactivated');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        this.logger.log(`User logged in: ${user.email}`);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async refresh(refreshToken) {
        const stored = await this.db.queryOne('SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1', [refreshToken]);
        if (!stored) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (new Date() > new Date(stored.expires_at)) {
            await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
            throw new common_1.UnauthorizedException('Refresh token expired, please login again');
        }
        const user = await this.db.queryOne('SELECT id, email, role, is_active FROM users WHERE id = $1', [stored.user_id]);
        if (!user || !user.is_active) {
            throw new common_1.UnauthorizedException('User not found or account disabled');
        }
        await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        return this.generateTokens(user.id, user.email, user.role);
    }
    async logout(refreshToken) {
        await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        return { message: 'Logged out successfully' };
    }
    async getMe(userId) {
        const user = await this.db.queryOne(`SELECT id, email, first_name, last_name, role,
              is_verified, profile_photo, bio, phone, district, created_at
       FROM users WHERE id = $1`, [userId]);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.sanitizeUser(user);
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessSecret = this.config.get('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.get('JWT_REFRESH_SECRET');
        const ACCESS_TOKEN_TTL = 60 * 15;
        const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
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
        await this.db.query(`INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)`, [refreshToken, userId, expiresAt]);
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map