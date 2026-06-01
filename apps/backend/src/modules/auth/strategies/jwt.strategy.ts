import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../database/database.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
  ) {
  super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: config.get<string>('JWT_ACCESS_SECRET') as string,
});
  }
  async validate(payload: JwtPayload) {
    const user = await this.db.queryOne<{ id: string; is_active: boolean }>(
      'SELECT id, is_active FROM users WHERE id = $1',
      [payload.sub],
    );

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or account disabled');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}