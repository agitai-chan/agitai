import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  SignupDto,
  LoginDto,
  GoogleLoginDto,
  GoogleSignupCompleteDto,
  PasswordResetDto,
  SignupResponseDto,
  LoginResponseDto,
  GoogleNewUserResponseDto,
} from './dto/auth.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
  MessageResponseDto,
} from '../../common/dto/api-response.dto';

@ApiTags('User')
@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({
    operationId: 'signupWithEmail',
    summary: 'AGIT-US01 이메일 회원가입',
    description: '비회원이 이메일/비밀번호를 입력해 새 계정 생성',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: SignupResponseDto })
  @ApiResponse({ status: 400, description: '유효성 검증 실패', type: ValidationErrorResponseDto })
  @ApiResponse({ status: 409, description: '이미 가입된 이메일', type: ErrorResponseDto })
  async signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'loginWithEmail',
    summary: 'AGIT-US02 이메일 로그인',
    description: '기존 회원 로그인 (5회 실패 시 5분 잠금)',
  })
  @ApiResponse({ status: 200, description: '로그인 성공', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '로그인 시도 횟수 초과', type: ErrorResponseDto })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('google-login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'loginWithGoogle',
    summary: 'AGIT-US03 구글 로그인',
    description: 'Google OAuth를 통한 소셜 로그인',
  })
  @ApiResponse({ status: 200, description: '로그인 성공', type: LoginResponseDto })
  @ApiResponse({ status: 201, description: '신규 계정 - 추가정보 입력 필요', type: GoogleNewUserResponseDto })
  @ApiResponse({ status: 401, description: 'Google 인증 실패', type: ErrorResponseDto })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto);
  }

  @Post('password-reset')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'requestPasswordReset',
    summary: 'AGIT-US04 비밀번호 재설정 요청',
    description: '비밀번호 재설정 이메일 발송 (1분에 1회 제한)',
  })
  @ApiResponse({ status: 200, description: '이메일 발송 성공', type: MessageResponseDto })
  @ApiResponse({ status: 404, description: '미가입 이메일', type: ErrorResponseDto })
  @ApiResponse({ status: 429, description: '재발송 제한', type: ErrorResponseDto })
  async passwordReset(@Body() dto: PasswordResetDto): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('google-signup-complete')
  @Public()
  @ApiOperation({
    operationId: 'completeGoogleSignup',
    summary: 'AGIT-US05 구글 회원가입 완료',
    description: 'Google OAuth로 인증된 신규 사용자의 추가 정보 입력',
  })
  @ApiResponse({ status: 201, description: '회원가입 완료', type: SignupResponseDto })
  @ApiResponse({ status: 400, description: '유효성 검증 실패', type: ValidationErrorResponseDto })
  @ApiResponse({ status: 409, description: '이미 가입된 이메일/닉네임', type: ErrorResponseDto })
  async googleSignupComplete(@Body() dto: GoogleSignupCompleteDto): Promise<SignupResponseDto> {
    return this.authService.completeGoogleSignup(dto);
  }
}
