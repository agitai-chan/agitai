import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ minLength: 8, maxLength: 32 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다',
  })
  password?: string;

  @ApiProperty({ minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  real_name: string;

  @ApiProperty({ minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nick_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone_number?: string;
}

export class UserProfileResponseDto {
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
