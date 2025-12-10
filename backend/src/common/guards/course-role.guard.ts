import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { COURSE_ROLES_KEY, CourseRoleType } from '../decorators/roles.decorator';

@Injectable()
export class CourseRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CourseRoleType[]>(
      COURSE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.courseId;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다');
    }

    if (!courseId) {
      throw new ForbiddenException('코스 ID가 필요합니다');
    }

    // Check if course exists
    const course = await this.prismaService.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('코스를 찾을 수 없습니다');
    }

    // Check user's role in course
    const membership = await this.prismaService.courseMember.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('코스에 대한 접근 권한이 없습니다');
    }

    // Check if user has required role
    // Manager has all permissions in course
    if (membership.role === 'Manager') {
      request.courseRole = 'Manager';
      return true;
    }

    // Expert has more permissions than Participant
    if (membership.role === 'Expert' && requiredRoles.includes('Expert')) {
      request.courseRole = 'Expert';
      return true;
    }

    if (requiredRoles.includes(membership.role as CourseRoleType)) {
      request.courseRole = membership.role;
      return true;
    }

    throw new ForbiddenException('이 작업을 수행할 권한이 없습니다');
  }
}
