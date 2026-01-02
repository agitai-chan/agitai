import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { UpdateProfileDto, UserProfileResponseDto } from './dto/users.dto';

// 프로필 이미지 업로드 버킷 및 폴더 상수
const PROFILE_IMAGE_BUCKET = 'uploads';
const PROFILE_IMAGE_FOLDER = 'profiles';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private filesService: FilesService,
  ) {}

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_003',
        message: '사용자를 찾을 수 없습니다',
      });
    }

    return this.toUserProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    profileImage?: Express.Multer.File,
  ): Promise<UserProfileResponseDto> {
    // Check nickname uniqueness if changed
    const currentUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException({
        code: 'USER_003',
        message: '사용자를 찾을 수 없습니다',
      });
    }

    if (dto.nick_name !== currentUser.nickName) {
      const existingNickname = await this.prismaService.user.findFirst({
        where: {
          nickName: dto.nick_name,
          NOT: { id: userId },
        },
      });

      if (existingNickname) {
        throw new ConflictException({
          code: 'USER_002',
          message: '이미 사용 중인 닉네임입니다',
        });
      }
    }

    // 프로필 이미지 업로드 처리
    let profileImageUrl: string | undefined;
    if (profileImage) {
      const uploadResult = await this.filesService.uploadFile(
        PROFILE_IMAGE_BUCKET,
        profileImage,
        PROFILE_IMAGE_FOLDER,
      );
      profileImageUrl = uploadResult.url;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        realName: dto.real_name,
        nickName: dto.nick_name,
        phoneNumber: dto.phone_number,
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      },
    });

    return this.toUserProfile(updatedUser);
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  private toUserProfile(user: any): UserProfileResponseDto {
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
