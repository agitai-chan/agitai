import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromptsService } from './prompts.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Prompt')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('task')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  // TODO: Implement prompt endpoints
}
