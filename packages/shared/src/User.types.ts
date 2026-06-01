import { Role } from './roles.enum';

/**
 * Shape of the payload encoded inside every JWT access token.
 * Keep this minimal — avoid putting sensitive fields here.
 */
export interface JwtPayload {
  sub: string;   // user UUID
  email: string;
  role: Role;
  iat?: number;  // issued at (added by jwt.sign)
  exp?: number;  // expiry  (added by jwt.sign)
}

/**
 * Public-facing user profile returned by the API.
 * Never expose passwordHash or refresh tokens here.
 */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  profilePhoto: string | null;
  bio: string | null;
  district: string | null;
  isVerified: boolean;
  rating: number | null;
  createdAt: string;
}