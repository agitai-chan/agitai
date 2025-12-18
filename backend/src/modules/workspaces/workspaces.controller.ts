import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { WorkspaceRoleGuard } from '../../common/guards/workspace-role.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { RequireWorkspaceRole } from '../../common/decorators/roles.decorator';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceInviteDto,
  DeleteWorkspaceDto,
  WorkspaceResponseDto,
  InviteLinkResponseDto,
} from './dto/workspaces.dto';
import { ErrorResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Workspace')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post('/')
  @ApiOperation({
    operationId: 'createWorkspace',
    summary: 'AGIT-WS01 워크스페이스 생성',
    description: 'System 허가 이메일만 생성 가능',
  })
  @ApiResponse({ status: 201, description: '워크스페이스 생성 성공', type: WorkspaceResponseDto })
  @ApiResponse({ status: 403, description: '생성 권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: '이름 중복', type: ErrorResponseDto })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    operationId: 'listWorkspaces',
    summary: 'AGIT-WS02 워크스페이스 목록',
  })
  @ApiResponse({ status: 200, description: '워크스페이스 목록 조회 성공', type: [WorkspaceResponseDto] })
  async findAll(@CurrentUser() user: CurrentUserPayload): Promise<WorkspaceResponseDto[]> {
    return this.workspacesService.findAll(user.id);
  }

  @Post(':workspaceId/invite')
  @UseGuards(WorkspaceRoleGuard)
  @RequireWorkspaceRole('Owner')
  @ApiOperation({
    operationId: 'inviteToWorkspace',
    summary: 'AGIT-WS03 워크스페이스 초대',
    description: 'Owner만 초대 가능, URL 링크 방식, 최대 100명, 24시간 유효',
  })
  @ApiResponse({ status: 200, description: '초대 링크 생성 성공', type: InviteLinkResponseDto })
  @ApiResponse({ status: 403, description: '권한 부족', type: ErrorResponseDto })
  async invite(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: WorkspaceInviteDto,
  ): Promise<InviteLinkResponseDto> {
    return this.workspacesService.createInvite(workspaceId, user.id, dto);
  }

  @Get(':workspaceId/settings')
  @UseGuards(WorkspaceRoleGuard)
  @RequireWorkspaceRole('Member')
  @ApiOperation({
    operationId: 'getWorkspaceSettings',
    summary: 'AGIT-WS04 워크스페이스 설정 조회',
  })
  @ApiResponse({ status: 200, description: '워크스페이스 설정 조회 성공', type: WorkspaceResponseDto })
  async getSettings(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.findOne(workspaceId, user.id);
  }

  @Put(':workspaceId/settings')
  @UseGuards(WorkspaceRoleGuard)
  @RequireWorkspaceRole('Owner')
  @ApiOperation({
    operationId: 'updateWorkspaceSettings',
    summary: 'AGIT-WS04 워크스페이스 설정 수정',
  })
  @ApiResponse({ status: 200, description: '워크스페이스 설정 수정 성공', type: WorkspaceResponseDto })
  @ApiResponse({ status: 403, description: '권한 부족', type: ErrorResponseDto })
  async updateSettings(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.update(workspaceId, dto);
  }

  @Delete(':workspaceId/settings')
  @UseGuards(WorkspaceRoleGuard)
  @RequireWorkspaceRole('Owner')
  @ApiOperation({
    operationId: 'deleteWorkspace',
    summary: 'AGIT-WS04 워크스페이스 삭제',
  })
  @ApiResponse({ status: 200, description: '워크스페이스 삭제 성공' })
  @ApiResponse({ status: 400, description: '이름 불일치', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 부족', type: ErrorResponseDto })
  async delete(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: DeleteWorkspaceDto,
  ): Promise<void> {
    return this.workspacesService.delete(workspaceId, dto.confirm_name);
  }
}
