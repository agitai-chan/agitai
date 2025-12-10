import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Course')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // TODO: Implement course endpoints
}
