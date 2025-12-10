import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 필요합니다');
    }

    const token = authHeader.substring(7);

    try {
      // Verify token with Supabase
      const supabaseUser = await this.supabaseService.getUser(token);

      if (!supabaseUser || !supabaseUser.email) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다');
      }

      // Get user from database
      const user = await this.prismaService.user.findUnique({
        where: { email: supabaseUser.email },
        select: {
          id: true,
          email: true,
          realName: true,
          nickName: true,
          isSystemAdmin: true,
          lockedUntil: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다');
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new UnauthorizedException('계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.');
      }

      // Attach user to request
      request.user = {
        id: user.id,
        email: user.email,
        realName: user.realName,
        nickName: user.nickName,
        isSystemAdmin: user.isSystemAdmin,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('인증에 실패했습니다');
    }
  }
}
