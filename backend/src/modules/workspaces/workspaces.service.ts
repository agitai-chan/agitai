import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceInviteDto,
  WorkspaceResponseDto,
  InviteLinkResponseDto,
} from './dto/workspaces.dto';

@Injectable()
export class WorkspacesService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    // Check if user is system admin (allowed to create workspaces)
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isSystemAdmin) {
      throw new ForbiddenException({
        code: 'WS_001',
        message: '워크스페이스 생성 권한이 없습니다',
      });
    }

    // Check name uniqueness
    const existingWorkspace = await this.prismaService.workspace.findFirst({
      where: { name: dto.name },
    });

    if (existingWorkspace) {
      throw new ConflictException({
        code: 'WS_002',
        message: '이미 존재하는 워크스페이스 이름입니다',
      });
    }

    // Create workspace
    const workspace = await this.prismaService.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'Owner',
          },
        },
      },
      include: {
        owner: true,
        _count: { select: { members: true } },
      },
    });

    return this.toWorkspaceResponse(workspace, 'Owner');
  }

  async findAll(userId: string): Promise<WorkspaceResponseDto[]> {
    const memberships = await this.prismaService.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            owner: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    return memberships.map((m) => this.toWorkspaceResponse(m.workspace, m.role));
  }

  async findOne(workspaceId: string, userId: string): Promise<WorkspaceResponseDto> {
    const membership = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      include: {
        workspace: {
          include: {
            owner: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException({
        code: 'WS_003',
        message: '워크스페이스에 대한 접근 권한이 없습니다',
      });
    }

    return this.toWorkspaceResponse(membership.workspace, membership.role);
  }

  async createInvite(
    workspaceId: string,
    userId: string,
    dto: WorkspaceInviteDto,
  ): Promise<InviteLinkResponseDto> {
    // Check if user is owner
    const membership = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });

    if (!membership || membership.role !== 'Owner') {
      throw new ForbiddenException({
        code: 'WS_004',
        message: '초대 링크 생성 권한이 없습니다',
      });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invite = await this.prismaService.workspaceInvite.create({
      data: {
        workspaceId,
        token,
        maxUses: dto.max_uses || 100,
        expiresAt,
      },
    });

    return {
      invite_url: `${process.env.FRONTEND_URL}/invite/workspace/${token}`,
      token: invite.token,
      max_uses: invite.maxUses,
      expires_at: invite.expiresAt,
    };
  }

  async joinByInvite(token: string, userId: string): Promise<WorkspaceResponseDto> {
    const invite = await this.prismaService.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invite) {
      throw new NotFoundException({
        code: 'WS_005',
        message: '유효하지 않은 초대 링크입니다',
      });
    }

    if (new Date() > invite.expiresAt) {
      throw new GoneException({
        code: 'WS_006',
        message: '만료된 초대 링크입니다',
      });
    }

    if (invite.usedCount >= invite.maxUses) {
      throw new GoneException({
        code: 'WS_007',
        message: '초대 링크 사용 횟수가 초과되었습니다',
      });
    }

    // Check if already a member
    const existingMembership = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException({
        code: 'WS_008',
        message: '이미 워크스페이스의 멤버입니다',
      });
    }

    // Create membership and update invite count
    await this.prismaService.$transaction([
      this.prismaService.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId,
          role: 'Member',
        },
      }),
      this.prismaService.workspaceInvite.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return this.findOne(invite.workspaceId, userId);
  }

  async update(
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.prismaService.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: {
        owner: true,
        _count: { select: { members: true } },
      },
    });

    return this.toWorkspaceResponse(workspace, 'Owner');
  }

  async delete(workspaceId: string, confirmName: string): Promise<void> {
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException({
        code: 'WS_009',
        message: '워크스페이스를 찾을 수 없습니다',
      });
    }

    if (workspace.name !== confirmName) {
      throw new BadRequestException({
        code: 'WS_010',
        message: '워크스페이스 이름이 일치하지 않습니다',
      });
    }

    await this.prismaService.workspace.delete({
      where: { id: workspaceId },
    });
  }

  private toWorkspaceResponse(workspace: any, role: string): WorkspaceResponseDto {
    return {
      workspace_id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      logo_image: workspace.logoImage,
      owner: {
        user_id: workspace.owner.id,
        nick_name: workspace.owner.nickName,
      },
      member_count: workspace._count?.members || 0,
      my_role: role,
      created_at: workspace.createdAt,
      updated_at: workspace.updatedAt,
    };
  }
}
