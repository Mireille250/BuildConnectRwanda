"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    config;
    pool;
    logger = new common_1.Logger(DatabaseService_1.name);
    constructor(config) {
        this.config = config;
    }
    async onModuleInit() {
        this.pool = new pg_1.Pool({
            connectionString: this.config.get('DATABASE_URL'),
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
        });
        try {
            const client = await this.pool.connect();
            client.release();
            this.logger.log('PostgreSQL connected successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to PostgreSQL', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.pool.end();
        this.logger.log('PostgreSQL pool closed');
    }
    async query(sql, params = []) {
        const start = Date.now();
        try {
            const result = await this.pool.query(sql, params);
            const duration = Date.now() - start;
            if (duration > 200) {
                this.logger.warn(`Slow query (${duration}ms): ${sql.slice(0, 120)}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Query failed: ${sql.slice(0, 120)}`, error);
            throw error;
        }
    }
    async transaction(fn) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transaction rolled back', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async queryOne(sql, params = []) {
        const result = await this.query(sql, params);
        return result.rows[0] ?? null;
    }
    async queryMany(sql, params = []) {
        const result = await this.query(sql, params);
        return result.rows;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map