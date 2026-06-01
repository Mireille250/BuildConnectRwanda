import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.pool = new Pool({
      connectionString: this.config.get<string>('DATABASE_URL'),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log('PostgreSQL connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('PostgreSQL pool closed');
  }

  async query<T extends QueryResultRow = Record<string, never>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(sql, params);
      const duration = Date.now() - start;
      if (duration > 200) {
        this.logger.warn(`Slow query (${duration}ms): ${sql.slice(0, 120)}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Query failed: ${sql.slice(0, 120)}`, error);
      throw error;
    }
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transaction rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async queryOne<T extends QueryResultRow = Record<string, never>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  async queryMany<T extends QueryResultRow = Record<string, never>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.rows;
  }
}