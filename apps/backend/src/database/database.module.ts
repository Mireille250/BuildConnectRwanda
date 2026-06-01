import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * @Global() means you register this module once in AppModule
 * and DatabaseService becomes available everywhere without
 * re-importing DatabaseModule in every feature module.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}