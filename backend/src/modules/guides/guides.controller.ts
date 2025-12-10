import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GuidesService } from './guides.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Guide')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('task')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  // TODO: Implement guide endpoints
}
