import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users/me/profile
   * Returns the logged-in user's full profile
   */
  @Get('me/profile')
  getMyProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.getMyProfile(user.id);
  }

  /**
   * GET /api/v1/users/:id/profile
   * Returns any user's public profile
   */
  @Get(':id/profile')
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getPublicProfile(id);
  }

  /**
   * PATCH /api/v1/users/me/profile
   * Update logged-in user's profile
   */
  @Patch('me/profile')
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  /**
   * PATCH /api/v1/users/me/password
   * Change logged-in user's password
   */
  @Patch('me/password')
  changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }
}
