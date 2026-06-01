import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VerificationService } from './verification.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * POST /api/v1/verification/upload
   * Upload a verification document
   * Accepts multipart/form-data with fields: file, docType
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Only JPG, PNG and PDF files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  uploadDocument(
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('docType') docType: string,
  ) {
    return this.verificationService.uploadDocument(user.id, file, docType);
  }

  /**
   * GET /api/v1/verification/my
   * Get my uploaded documents and their status
   */
  @Get('my')
  getMyDocuments(@CurrentUser() user: RequestUser) {
    return this.verificationService.getMyDocuments(user.id);
  }

  /**
   * GET /api/v1/verification/pending
   * ADMIN — view all pending documents
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getPendingDocuments(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.verificationService.getPendingDocuments(
      Number(page),
      Number(limit),
    );
  }

  /**
   * GET /api/v1/verification/user/:id
   * ADMIN — view all documents for a specific user
   */
  @Get('user/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getUserDocuments(@Param('id', ParseUUIDPipe) userId: string) {
    return this.verificationService.getUserDocuments(userId);
  }

  /**
   * PATCH /api/v1/verification/:id/review
   * ADMIN — approve or reject a document
   */
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  reviewDocument(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.verificationService.reviewDocument(user.id, documentId, dto);
  }
}