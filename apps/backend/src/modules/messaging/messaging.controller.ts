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
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  /**
   * POST /api/v1/messaging/conversations
   * Start or get existing conversation with another user
   */
  @Post('conversations')
  @HttpCode(HttpStatus.OK)
  getOrCreateConversation(
    @CurrentUser() user: RequestUser,
    @Body('otherUserId', ParseUUIDPipe) otherUserId: string,
  ) {
    return this.messagingService.getOrCreateConversation(user.id, otherUserId);
  }

  /**
   * GET /api/v1/messaging/conversations
   * Get all conversations for logged-in user
   */
  @Get('conversations')
  getMyConversations(@CurrentUser() user: RequestUser) {
    return this.messagingService.getMyConversations(user.id);
  }

  /**
   * GET /api/v1/messaging/conversations/:id/messages
   * Load message history for a conversation
   */
  @Get('conversations/:id/messages')
  getMessages(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.messagingService.getMessages(
      user.id,
      conversationId,
      Number(page),
      Number(limit),
    );
  }
}