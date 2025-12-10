import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('task')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // TODO: Implement comment endpoints
}
