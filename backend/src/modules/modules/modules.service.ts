import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private prismaService: PrismaService) {}

  // TODO: Implement module CRUD operations
}
