import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GuidesService {
  constructor(private prismaService: PrismaService) {}

  // TODO: Implement guide CRUD operations
}
