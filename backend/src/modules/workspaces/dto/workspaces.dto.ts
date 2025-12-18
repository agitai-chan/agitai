import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min, Max } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class WorkspaceInviteDto {
  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  max_uses?: number = 100;
}

export class DeleteWorkspaceDto {
  @ApiProperty({ description: '워크스페이스 이름 확인' })
  @IsString()
  confirm_name: string;
}

export class WorkspaceResponseDto {
  @ApiProperty({ format: 'uuid' })
  workspace_id: string;

  @ApiProperty()
  workspace_name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  workspace_color?: string;

  @ApiPropertyOptional({ format: 'uri' })
  logo_image?: string;

  @ApiProperty()
  owner: {
    user_id: string;
    nick_name: string;
  };

  @ApiProperty()
  member_count: number;

  @ApiProperty({ default: 0 })
  course_count: number;

  @ApiProperty()
  user_role: string;

  @ApiProperty({ default: false })
  is_starred: boolean;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;

  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}

export class InviteLinkResponseDto {
  @ApiProperty()
  invite_url: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  max_uses: number;

  @ApiProperty({ format: 'date-time' })
  expires_at: Date;
}
