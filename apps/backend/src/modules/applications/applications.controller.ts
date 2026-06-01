import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * POST /api/v1/applications/:jobId
   * Only ENGINEER, WORKER, SUPPLIER can apply
   */
  @Post(':jobId')
  @UseGuards(RolesGuard)
  @Roles('ENGINEER', 'WORKER', 'SUPPLIER')
  @HttpCode(HttpStatus.CREATED)
  applyToJob(
    @CurrentUser() user: RequestUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.applyToJob(user.id, jobId, dto);
  }

  /**
   * GET /api/v1/applications/my
   * Get logged-in user's own applications
   */
  @Get('my')
  getMyApplications(@CurrentUser() user: RequestUser) {
    return this.applicationsService.getMyApplications(user.id);
  }

  /**
   * GET /api/v1/applications/job/:jobId
   * CLIENT views all applicants for their job
   */
  @Get('job/:jobId')
  getJobApplicants(
    @CurrentUser() user: RequestUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.applicationsService.getJobApplicants(user.id, jobId);
  }

  /**
   * PATCH /api/v1/applications/:id/accept
   * CLIENT accepts an applicant
   */
  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  acceptApplication(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.acceptApplication(user.id, id);
  }

  /**
   * PATCH /api/v1/applications/:id/reject
   * CLIENT rejects an applicant
   */
  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  rejectApplication(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.rejectApplication(user.id, id);
  }

  /**
   * DELETE /api/v1/applications/:id
   * Applicant withdraws their application
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  withdrawApplication(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applicationsService.withdrawApplication(user.id, id);
  }
}