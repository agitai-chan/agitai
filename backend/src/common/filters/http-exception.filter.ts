import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Array<{ field: string; message: string }>;
    retryAfter?: number;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>;
        
        // Handle validation errors from class-validator
        if (resp.message && Array.isArray(resp.message)) {
          errorResponse = {
            error: {
              code: this.getErrorCode(status),
              message: '유효성 검증에 실패했습니다',
              fields: resp.message.map((msg: string) => {
                const parts = msg.split(' ');
                return {
                  field: parts[0] || 'unknown',
                  message: msg,
                };
              }),
            },
          };
        } else {
          errorResponse = {
            error: {
              code: resp.code || this.getErrorCode(status),
              message: resp.message || exception.message,
              ...(resp.retryAfter && { retryAfter: resp.retryAfter }),
            },
          };
        }
      } else {
        errorResponse = {
          error: {
            code: this.getErrorCode(status),
            message: String(exceptionResponse),
          },
        };
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 내부 오류가 발생했습니다',
        },
      };

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Log the error
    this.logger.warn(
      `${request.method} ${request.url} ${status} - ${errorResponse.error.message}`,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      410: 'GONE',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
