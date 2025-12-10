import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { UpdateProfileDto, UserProfileResponseDto } from './dto/users.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    operationId: 'getProfile',
    summary: 'AGIT-US05 프로필 조회',
  })
  @ApiResponse({ status: 200, description: '프로필 조회 성공', type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요', type: ErrorResponseDto })
  async getProfile(@CurrentUser() user: CurrentUserPayload): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    operationId: 'updateProfile',
    summary: 'AGIT-US05 프로필 수정',
  })
  @ApiResponse({ status: 200, description: '프로필 수정 성공', type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: '유효성 검증 실패', type: ValidationErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: '닉네임 중복', type: ErrorResponseDto })
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(user.id, dto, profileImage);
  }
}
