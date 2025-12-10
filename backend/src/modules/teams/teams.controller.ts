import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Team')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // TODO: Implement team endpoints
}
