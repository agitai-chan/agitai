import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userInfo = user ? `user:${user.id}` : 'anonymous';
    const now = Date.now();

    // Log request
    this.logger.log(`→ ${method} ${url} [${userInfo}]`);

    // Log request body in development
    if (process.env.NODE_ENV === 'development' && body && Object.keys(body).length > 0) {
      // Mask sensitive fields
      const maskedBody = this.maskSensitiveData(body);
      this.logger.debug(`Request body: ${JSON.stringify(maskedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.log(`← ${method} ${url} ${response.statusCode} ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(`← ${method} ${url} ${error.status || 500} ${duration}ms - ${error.message}`);
        },
      }),
    );
  }

  private maskSensitiveData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'password_confirm', 'token', 'access_token', 'refresh_token'];
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }

    return masked;
  }
}
