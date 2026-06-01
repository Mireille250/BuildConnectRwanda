import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * POST /api/v1/jobs
   * Only CLIENT and COMPANY can post jobs
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENT', 'COMPANY')
  @HttpCode(HttpStatus.CREATED)
  createJob(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.createJob(user.id, dto);
  }

  /**
   * GET /api/v1/jobs
   * Anyone authenticated can browse jobs
   */
  @Get()
  searchJobs(@Query() query: SearchJobsDto) {
    return this.jobsService.searchJobs(query);
  }

  /**
   * GET /api/v1/jobs/saved
   * Get saved jobs — must come before :id route
   */
  @Get('saved')
  getSavedJobs(@CurrentUser() user: RequestUser) {
    return this.jobsService.getSavedJobs(user.id);
  }

  /**
   * GET /api/v1/jobs/my
   * Get jobs posted by the logged-in user
   */
  @Get('my')
  getMyJobs(@CurrentUser() user: RequestUser) {
    return this.jobsService.getMyJobs(user.id);
  }

  /**
   * GET /api/v1/jobs/:id
   */
  @Get(':id')
  getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobById(id);
  }

  /**
   * PATCH /api/v1/jobs/:id
   * Only the job poster can update
   */
  @Patch(':id')
  updateJob(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(user.id, id, dto);
  }

  /**
   * DELETE /api/v1/jobs/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteJob(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.deleteJob(user.id, id);
  }

  /**
   * POST /api/v1/jobs/:id/save
   */
  @Post(':id/save')
  @HttpCode(HttpStatus.OK)
  saveJob(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.saveJob(user.id, id);
  }

  /**
   * DELETE /api/v1/jobs/:id/save
   */
  @Delete(':id/save')
  @HttpCode(HttpStatus.OK)
  unsaveJob(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobsService.unsaveJob(user.id, id);
  }
}