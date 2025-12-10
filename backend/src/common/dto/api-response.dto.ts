import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: {
      code: 'ERROR_CODE',
      message: '에러 메시지',
    },
  })
  error: {
    code: string;
    message: string;
    fields?: Array<{ field: string; message: string }>;
    retryAfter?: number;
  };
}

export class MessageResponseDto {
  @ApiProperty({ example: '작업이 완료되었습니다' })
  message: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    example: {
      code: 'VALIDATION_ERROR',
      message: '유효성 검증에 실패했습니다',
      fields: [
        { field: 'email', message: '올바른 이메일 형식이 아닙니다' },
      ],
    },
  })
  error: {
    code: string;
    message: string;
    fields: Array<{ field: string; message: string }>;
  };
}
