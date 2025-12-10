import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Module')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  // TODO: Implement module endpoints
}
