import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { TEAM_ROLES_KEY, TeamRoleType } from '../decorators/roles.decorator';

@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<TeamRoleType[]>(
      TEAM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다');
    }

    if (!teamId) {
      throw new ForbiddenException('팀 ID가 필요합니다');
    }

    // Check if team exists
    const team = await this.prismaService.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('팀을 찾을 수 없습니다');
    }

    // Check user's membership in team
    const membership = await this.prismaService.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      // Check if user is Manager/Expert in course
      const courseMembership = await this.prismaService.courseMember.findUnique({
        where: {
          courseId_userId: {
            courseId: team.courseId,
            userId: user.id,
          },
        },
      });

      if (courseMembership && ['Manager', 'Expert'].includes(courseMembership.role)) {
        request.teamRole = null;
        request.courseRole = courseMembership.role;
        return true;
      }

      throw new ForbiddenException('팀에 대한 접근 권한이 없습니다');
    }

    // If no specific roles required, just being a member is enough
    if (!requiredRoles || requiredRoles.length === 0) {
      request.teamRole = membership.role;
      return true;
    }

    if (requiredRoles.includes(membership.role as TeamRoleType)) {
      request.teamRole = membership.role;
      return true;
    }

    throw new ForbiddenException('이 작업을 수행할 권한이 없습니다');
  }
}
