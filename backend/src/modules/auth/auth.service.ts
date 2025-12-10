import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  SignupDto,
  LoginDto,
  GoogleLoginDto,
  PasswordResetDto,
  SignupResponseDto,
  LoginResponseDto,
  UserProfileDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 5;

  constructor(
    private prismaService: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    // Validate passwords match
    if (dto.password !== dto.password_confirm) {
      throw new BadRequestException({
        code: 'AUTH_001',
        message: '비밀번호가 일치하지 않습니다',
      });
    }

    // Check terms agreement
    if (!dto.terms_all_agree) {
      throw new BadRequestException({
        code: 'AUTH_002',
        message: '이용약관에 동의해야 합니다',
      });
    }

    // Check if email already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        code: 'USER_001',
        message: '이미 가입된 이메일입니다',
      });
    }

    // Check if nickname already exists
    const existingNickname = await this.prismaService.user.findUnique({
      where: { nickName: dto.nick_name },
    });

    if (existingNickname) {
      throw new ConflictException({
        code: 'USER_002',
        message: '이미 사용 중인 닉네임입니다',
      });
    }

    // Create user in Supabase Auth
    const { data: supabaseData, error: supabaseError } =
      await this.supabaseService.signUpWithEmail(dto.email, dto.password);

    if (supabaseError) {
      throw new BadRequestException({
        code: 'AUTH_003',
        message: '회원가입에 실패했습니다: ' + supabaseError.message,
      });
    }

    // Create user in database
    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        realName: dto.real_name,
        nickName: dto.nick_name,
      },
    });

    return {
      user_id: user.id,
      email: user.email,
      message: '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.',
      redirect_url: '/login',
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_004',
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      });
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const retryAfter = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 1000,
      );
      throw new HttpException(
        {
          code: 'AUTH_005',
          message: '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Attempt login with Supabase
    const { data: supabaseData, error: supabaseError } =
      await this.supabaseService.signInWithEmail(dto.email, dto.password);

    if (supabaseError) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: newAttempts };

      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000,
        );
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException({
        code: 'AUTH_004',
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      });
    }

    // Reset login attempts on successful login
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    const session = supabaseData.session!;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'Bearer',
      expires_in: session.expires_in || 3600,
      user: this.toUserProfile(user),
    };
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<LoginResponseDto | { is_new_user: boolean; google_email: string; redirect_url: string }> {
    const { data: supabaseData, error: supabaseError } =
      await this.supabaseService.signInWithGoogle(dto.google_token);

    if (supabaseError) {
      throw new UnauthorizedException({
        code: 'AUTH_006',
        message: 'Google 인증에 실패했습니다',
      });
    }

    const googleEmail = supabaseData.user?.email;
    if (!googleEmail) {
      throw new UnauthorizedException({
        code: 'AUTH_007',
        message: 'Google 계정에서 이메일을 가져올 수 없습니다',
      });
    }

    // Check if user exists
    let user = await this.prismaService.user.findUnique({
      where: { email: googleEmail },
    });

    // If new user, return info for additional registration
    if (!user) {
      return {
        is_new_user: true,
        google_email: googleEmail,
        redirect_url: '/signup/complete',
      };
    }

    const session = supabaseData.session!;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'Bearer',
      expires_in: session.expires_in || 3600,
      user: this.toUserProfile(user),
    };
  }

  async requestPasswordReset(dto: PasswordResetDto): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_003',
        message: '등록되지 않은 이메일입니다',
      });
    }

    // Send password reset email via Supabase
    const { error } = await this.supabaseService.resetPassword(dto.email);

    if (error) {
      throw new BadRequestException({
        code: 'AUTH_008',
        message: '비밀번호 재설정 이메일 발송에 실패했습니다',
      });
    }

    return {
      message: '비밀번호 재설정 이메일이 발송되었습니다',
    };
  }

  private toUserProfile(user: any): UserProfileDto {
    return {
      user_id: user.id,
      email: user.email,
      real_name: user.realName,
      nick_name: user.nickName,
      profile_image: user.profileImage,
      phone_number: user.phoneNumber,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
