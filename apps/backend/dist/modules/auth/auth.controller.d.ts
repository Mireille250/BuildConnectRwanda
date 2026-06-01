import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getMe(user: RequestUser): Promise<{
        id: string | undefined;
        email: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        role: string | undefined;
        isVerified: boolean | undefined;
        profilePhoto: string | null;
    }>;
}
