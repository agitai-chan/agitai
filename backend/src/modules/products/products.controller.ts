import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Product')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('task')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // TODO: Implement product endpoints
}
