import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * POST /api/v1/reviews
   * Only CLIENT and COMPANY can leave reviews
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENT', 'COMPANY')
  @HttpCode(HttpStatus.CREATED)
  createReview(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user.id, dto);
  }

  /**
   * GET /api/v1/reviews/my
   * Get reviews I have received
   */
  @Get('my')
  getMyReviews(
    @CurrentUser() user: RequestUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getMyReviews(user.id, Number(page), Number(limit));
  }

  /**
   * GET /api/v1/reviews/written
   * Get reviews I have written
   */
  @Get('written')
  getReviewsIWrote(@CurrentUser() user: RequestUser) {
    return this.reviewsService.getReviewsIWrote(user.id);
  }

  /**
   * GET /api/v1/reviews/user/:id
   * Get all reviews for any user — public
   */
  @Get('user/:id')
  getUserReviews(
    @Param('id', ParseUUIDPipe) targetId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getUserReviews(targetId, Number(page), Number(limit));
  }
}