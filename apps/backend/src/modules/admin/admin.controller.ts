import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /api/v1/admin/stats
   * Platform-wide statistics
   */
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  /**
   * GET /api/v1/admin/activity
   * Recent platform activity
   */
  @Get('activity')
  getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  /**
   * GET /api/v1/admin/users
   * List all users with optional filters
   */
  @Get('users')
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
  ) {
    return this.adminService.getUsers(
      Number(page),
      Number(limit),
      role,
      search,
      isActive !== undefined ? isActive === 'true' : undefined,
      isVerified !== undefined ? isVerified === 'true' : undefined,
    );
  }

  /**
   * GET /api/v1/admin/users/:id
   * Get detailed info for a single user
   */
  @Get('users/:id')
  getUserDetail(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   * Activate or deactivate a user
   */
  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  toggleUserStatus(
    @CurrentUser() admin: RequestUser,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.toggleUserStatus(admin.id, userId, isActive);
  }

  /**
   * GET /api/v1/admin/jobs
   * List all jobs with optional status filter
   */
  @Get('jobs')
  getJobs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getJobs(Number(page), Number(limit), status);
  }

  /**
   * DELETE /api/v1/admin/jobs/:id
   * Remove an inappropriate job
   */
  @Delete('jobs/:id')
  @HttpCode(HttpStatus.OK)
  deleteJob(
    @CurrentUser() admin: RequestUser,
    @Param('id', ParseUUIDPipe) jobId: string,
  ) {
    return this.adminService.deleteJob(admin.id, jobId);
  }
}