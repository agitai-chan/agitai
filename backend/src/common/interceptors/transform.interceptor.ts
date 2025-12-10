import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has the expected structure, return as is
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }

        // If data has pagination info, extract it
        if (data && typeof data === 'object' && 'pagination' in data) {
          const { pagination, ...rest } = data;
          return {
            data: rest,
            meta: { pagination },
          };
        }

        // Wrap data in standard response format
        return { data };
      }),
    );
  }
}
