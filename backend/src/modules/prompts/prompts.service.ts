import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PromptsService {
  constructor(
    private prismaService: PrismaService,
    private aiService: AiService,
  ) {}

  // TODO: Implement prompt operations with AI integration
}
