/**
 * 파일 업로드 공통 유틸리티 함수
 *
 * FormData 생성, 파일 유효성 검사, 미리보기 생성 등의 공통 기능 제공
 */

// 파일 업로드 설정 상수
export const FILE_UPLOAD_CONFIG = {
  // 기본 최대 파일 크기 (10MB)
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024,
  // 이미지 최대 파일 크기 (5MB)
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
  // 허용되는 이미지 타입
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  // 허용되는 문서 타입
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
} as const;

// 파일 업로드 에러 타입
export type FileUploadError = {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED';
  message: string;
};

// FormData 필드 값 타입
export type FormDataFieldValue = string | number | boolean | File | File[] | null | undefined;

// FormData 생성을 위한 데이터 타입
export type FormDataInput = Record<string, FormDataFieldValue>;

/**
 * 객체를 FormData로 변환하는 유틸리티 함수
 *
 * @param data - FormData로 변환할 객체
 * @returns FormData 인스턴스
 *
 * @example
 * ```ts
 * const formData = createFormData({
 *   nick_name: 'John',
 *   profile_image: fileObject,
 *   attachments: [file1, file2],
 * });
 * ```
 */
export function createFormData(data: FormDataInput): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      // 배열인 경우 (File[] 등)
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(key, item);
        } else if (item !== null && item !== undefined) {
          formData.append(key, String(item));
        }
      });
    } else if (value instanceof File) {
      // File 객체인 경우
      formData.append(key, value);
    } else if (typeof value === 'object') {
      // 객체인 경우 JSON 문자열로 변환
      formData.append(key, JSON.stringify(value));
    } else {
      // 기본 타입인 경우
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * 파일 크기 유효성 검사
 *
 * @param file - 검사할 파일
 * @param maxSize - 최대 허용 크기 (바이트)
 * @returns 유효하면 true, 아니면 에러 객체
 */
export function validateFileSize(
  file: File,
  maxSize: number = FILE_UPLOAD_CONFIG.DEFAULT_MAX_SIZE
): true | FileUploadError {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      code: 'FILE_TOO_LARGE',
      message: `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`,
    };
  }
  return true;
}

/**
 * 파일 타입 유효성 검사
 *
 * @param file - 검사할 파일
 * @param allowedTypes - 허용되는 MIME 타입 배열
 * @returns 유효하면 true, 아니면 에러 객체
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): true | FileUploadError {
  if (!allowedTypes.includes(file.type)) {
    return {
      code: 'INVALID_TYPE',
      message: `허용되지 않는 파일 형식입니다. 허용: ${allowedTypes.join(', ')}`,
    };
  }
  return true;
}

/**
 * 이미지 파일 유효성 검사 (크기 + 타입)
 *
 * @param file - 검사할 이미지 파일
 * @param maxSize - 최대 허용 크기 (기본값: 5MB)
 * @returns 유효하면 true, 아니면 에러 객체
 */
export function validateImageFile(
  file: File,
  maxSize: number = FILE_UPLOAD_CONFIG.IMAGE_MAX_SIZE
): true | FileUploadError {
  const typeValidation = validateFileType(file, FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES);
  if (typeValidation !== true) {
    return typeValidation;
  }

  return validateFileSize(file, maxSize);
}

/**
 * 파일 미리보기 URL 생성 (이미지용)
 *
 * @param file - 미리보기를 생성할 파일
 * @returns Promise<string> - base64 데이터 URL
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 파일 크기를 읽기 쉬운 문자열로 변환
 *
 * @param bytes - 바이트 단위 크기
 * @returns 읽기 쉬운 크기 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 파일 확장자 추출
 *
 * @param filename - 파일명
 * @returns 확장자 문자열 (점 제외)
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * MIME 타입에서 파일 종류 추론
 *
 * @param mimeType - MIME 타입 문자열
 * @returns 파일 종류 ('image' | 'document' | 'unknown')
 */
export function getFileCategory(mimeType: string): 'image' | 'document' | 'unknown' {
  if (FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType as typeof FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES[number])) {
    return 'image';
  }
  if (FILE_UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES.includes(mimeType as typeof FILE_UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES[number])) {
    return 'document';
  }
  return 'unknown';
}
