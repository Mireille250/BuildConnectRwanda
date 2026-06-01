import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PoolClient, QueryResult, QueryResultRow } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private pool;
    private readonly logger;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    query<T extends QueryResultRow = Record<string, never>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
    queryOne<T extends QueryResultRow = Record<string, never>>(sql: string, params?: unknown[]): Promise<T | null>;
    queryMany<T extends QueryResultRow = Record<string, never>>(sql: string, params?: unknown[]): Promise<T[]>;
}
