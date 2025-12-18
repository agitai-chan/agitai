import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8, maxLength: 32 })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다' })
  @MaxLength(32, { message: '비밀번호는 32자 이하여야 합니다' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다',
  })
  password: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password_confirm: string;

  @ApiProperty({ example: '홍길동', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2, { message: '실명은 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '실명은 20자 이하여야 합니다' })
  real_name: string;

  @ApiProperty({ example: '길동이', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 20자 이하여야 합니다' })
  nick_name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  terms_all_agree: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  remember_me?: boolean = false;
}

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google OAuth access token' })
  @IsString()
  google_token: string;
}

export class GoogleSignupCompleteDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Google 계정 이메일' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email: string;

  @ApiProperty({ example: '홍길동', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2, { message: '실명은 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '실명은 20자 이하여야 합니다' })
  real_name: string;

  @ApiProperty({ example: '길동이', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 20자 이하여야 합니다' })
  nick_name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  terms_all_agree: boolean;
}

export class PasswordResetDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email: string;
}

export class SignupResponseDto {
  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  redirect_url: string;
}

export class UserProfileDto {
  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty()
  real_name: string;

  @ApiProperty()
  nick_name: string;

  @ApiPropertyOptional({ format: 'uri' })
  profile_image?: string;

  @ApiPropertyOptional()
  phone_number?: string;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;

  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ type: () => UserProfileDto })
  user: UserProfileDto;
}

export class GoogleNewUserResponseDto {
  @ApiProperty()
  is_new_user: boolean;

  @ApiProperty({ format: 'email' })
  google_email: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  redirect_url: string;
}
