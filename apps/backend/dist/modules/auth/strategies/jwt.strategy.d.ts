import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../database/database.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly db;
    constructor(config: ConfigService, db: DatabaseService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export {};
