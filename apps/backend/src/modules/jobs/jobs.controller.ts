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
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // POST — requires auth
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT', 'COMPANY')
  @HttpCode(HttpStatus.CREATED)
  createJob(@CurrentUser() user: RequestUser, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(user.id, dto);
  }

  // GET all — PUBLIC
  @Get()
  searchJobs(@Query() query: SearchJobsDto) {
    return this.jobsService.searchJobs(query);
  }

  // GET saved — requires auth
  @Get('saved')
  @UseGuards(JwtAuthGuard)
  getSavedJobs(@CurrentUser() user: RequestUser) {
    return this.jobsService.getSavedJobs(user.id);
  }

  // GET my jobs — requires auth
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyJobs(@CurrentUser() user: RequestUser) {
    return this.jobsService.getMyJobs(user.id);
  }

  // GET single job — PUBLIC
  @Get(':id')
  getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobById(id);
  }

  // PATCH — requires auth
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateJob(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateJob(user.id, id, dto);
  }

  // DELETE — requires auth
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  deleteJob(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.deleteJob(user.id, id);
  }

  // Save/unsave — requires auth
  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  saveJob(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.saveJob(user.id, id);
  }

  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unsaveJob(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.unsaveJob(user.id, id);
  }
}