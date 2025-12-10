import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { WORKSPACE_ROLES_KEY, WorkspaceRoleType } from '../decorators/roles.decorator';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRoleType[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다');
    }

    if (!workspaceId) {
      throw new ForbiddenException('워크스페이스 ID가 필요합니다');
    }

    // Check if workspace exists
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다');
    }

    // Check user's role in workspace
    const membership = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('워크스페이스에 대한 접근 권한이 없습니다');
    }

    // Check if user has required role
    // Owner has all permissions
    if (membership.role === 'Owner') {
      request.workspaceRole = 'Owner';
      return true;
    }

    if (requiredRoles.includes(membership.role as WorkspaceRoleType)) {
      request.workspaceRole = membership.role;
      return true;
    }

    throw new ForbiddenException('이 작업을 수행할 권한이 없습니다');
  }
}
