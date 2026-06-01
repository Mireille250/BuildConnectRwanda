import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly db;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    constructor(db: DatabaseService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string | undefined;
            email: string | undefined;
            firstName: string | undefined;
            lastName: string | undefined;
            role: string | undefined;
            isVerified: boolean | undefined;
            profilePhoto: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string | undefined;
            email: string | undefined;
            firstName: string | undefined;
            lastName: string | undefined;
            role: string | undefined;
            isVerified: boolean | undefined;
            profilePhoto: string | null;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        id: string | undefined;
        email: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        role: string | undefined;
        isVerified: boolean | undefined;
        profilePhoto: string | null;
    }>;
    private generateTokens;
    private sanitizeUser;
}
