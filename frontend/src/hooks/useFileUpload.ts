import { useState, useCallback } from 'react';
import {
  createFilePreview,
  validateImageFile,
  validateFileSize,
  validateFileType,
  FILE_UPLOAD_CONFIG,
  type FileUploadError,
} from '@/utils/fileUpload';

/**
 * 파일 업로드 상태 타입
 */
export interface FileUploadState {
  /** 선택된 파일 */
  file: File | null;
  /** 미리보기 URL (이미지용) */
  preview: string | null;
  /** 에러 정보 */
  error: FileUploadError | null;
  /** 업로드 중 여부 */
  isLoading: boolean;
}

/**
 * 파일 업로드 훅 옵션
 */
export interface UseFileUploadOptions {
  /** 허용되는 파일 타입 (MIME 타입 배열) */
  allowedTypes?: readonly string[];
  /** 최대 파일 크기 (바이트) */
  maxSize?: number;
  /** 이미지 파일만 허용 (allowedTypes, maxSize 자동 설정) */
  imageOnly?: boolean;
  /** 파일 선택 시 콜백 */
  onFileSelect?: (file: File) => void;
  /** 에러 발생 시 콜백 */
  onError?: (error: FileUploadError) => void;
}

/**
 * 파일 업로드 훅 반환 타입
 */
export interface UseFileUploadReturn extends FileUploadState {
  /** 파일 선택 핸들러 (input onChange에 연결) */
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  /** 파일 직접 설정 */
  setFile: (file: File | null) => Promise<void>;
  /** 상태 초기화 */
  reset: () => void;
  /** 에러 제거 */
  clearError: () => void;
}

/**
 * 파일 업로드를 위한 커스텀 훅
 *
 * 파일 선택, 유효성 검사, 미리보기 생성 등의 기능을 제공합니다.
 *
 * @param options - 훅 옵션
 * @returns 파일 업로드 상태 및 핸들러
 *
 * @example
 * ```tsx
 * // 이미지 업로드 예시
 * const { file, preview, error, handleFileSelect, reset } = useFileUpload({
 *   imageOnly: true,
 *   onFileSelect: (file) => console.log('선택됨:', file.name),
 * });
 *
 * return (
 *   <div>
 *     <input type="file" accept="image/*" onChange={handleFileSelect} />
 *     {preview && <img src={preview} alt="미리보기" />}
 *     {error && <p>{error.message}</p>}
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // 문서 업로드 예시
 * const { file, error, handleFileSelect } = useFileUpload({
 *   allowedTypes: ['application/pdf'],
 *   maxSize: 10 * 1024 * 1024, // 10MB
 * });
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    allowedTypes = options.imageOnly
      ? FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES
      : [...FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES, ...FILE_UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES],
    maxSize = options.imageOnly
      ? FILE_UPLOAD_CONFIG.IMAGE_MAX_SIZE
      : FILE_UPLOAD_CONFIG.DEFAULT_MAX_SIZE,
    imageOnly = false,
    onFileSelect,
    onError,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    file: null,
    preview: null,
    error: null,
    isLoading: false,
  });

  /**
   * 파일 유효성 검사 및 미리보기 생성
   */
  const processFile = useCallback(
    async (file: File): Promise<boolean> => {
      // 유효성 검사
      let validation: true | FileUploadError;

      if (imageOnly) {
        validation = validateImageFile(file, maxSize);
      } else {
        validation = validateFileType(file, allowedTypes);
        if (validation === true) {
          validation = validateFileSize(file, maxSize);
        }
      }

      if (validation !== true) {
        setState((prev) => ({
          ...prev,
          error: validation as FileUploadError,
          isLoading: false,
        }));
        onError?.(validation as FileUploadError);
        return false;
      }

      // 이미지인 경우 미리보기 생성
      let preview: string | null = null;
      if (file.type.startsWith('image/')) {
        try {
          preview = await createFilePreview(file);
        } catch {
          // 미리보기 생성 실패는 무시
        }
      }

      setState({
        file,
        preview,
        error: null,
        isLoading: false,
      });

      onFileSelect?.(file);
      return true;
    },
    [allowedTypes, maxSize, imageOnly, onFileSelect, onError]
  );

  /**
   * input onChange 핸들러
   */
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await processFile(selectedFile);

      // input 초기화 (같은 파일 다시 선택 가능하도록)
      event.target.value = '';
    },
    [processFile]
  );

  /**
   * 파일 직접 설정
   */
  const setFile = useCallback(
    async (file: File | null): Promise<void> => {
      if (!file) {
        setState({
          file: null,
          preview: null,
          error: null,
          isLoading: false,
        });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await processFile(file);
    },
    [processFile]
  );

  /**
   * 상태 초기화
   */
  const reset = useCallback((): void => {
    setState({
      file: null,
      preview: null,
      error: null,
      isLoading: false,
    });
  }, []);

  /**
   * 에러 제거
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    handleFileSelect,
    setFile,
    reset,
    clearError,
  };
}

/**
 * 다중 파일 업로드 상태 타입
 */
export interface MultiFileUploadState {
  /** 선택된 파일 목록 */
  files: File[];
  /** 에러 정보 */
  error: FileUploadError | null;
  /** 업로드 중 여부 */
  isLoading: boolean;
}

/**
 * 다중 파일 업로드 훅 옵션
 */
export interface UseMultiFileUploadOptions extends Omit<UseFileUploadOptions, 'onFileSelect'> {
  /** 최대 파일 개수 */
  maxFiles?: number;
  /** 파일 추가 시 콜백 */
  onFilesChange?: (files: File[]) => void;
}

/**
 * 다중 파일 업로드 훅 반환 타입
 */
export interface UseMultiFileUploadReturn extends MultiFileUploadState {
  /** 파일 추가 핸들러 */
  handleFilesSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  /** 특정 파일 제거 */
  removeFile: (index: number) => void;
  /** 모든 파일 제거 */
  clearFiles: () => void;
  /** 에러 제거 */
  clearError: () => void;
}

/**
 * 다중 파일 업로드를 위한 커스텀 훅
 *
 * @param options - 훅 옵션
 * @returns 다중 파일 업로드 상태 및 핸들러
 *
 * @example
 * ```tsx
 * const { files, error, handleFilesSelect, removeFile } = useMultiFileUpload({
 *   maxFiles: 5,
 *   maxSize: 5 * 1024 * 1024,
 * });
 *
 * return (
 *   <div>
 *     <input type="file" multiple onChange={handleFilesSelect} />
 *     {files.map((file, index) => (
 *       <div key={index}>
 *         {file.name}
 *         <button onClick={() => removeFile(index)}>삭제</button>
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMultiFileUpload(
  options: UseMultiFileUploadOptions = {}
): UseMultiFileUploadReturn {
  const {
    allowedTypes = [
      ...FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES,
      ...FILE_UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES,
    ],
    maxSize = FILE_UPLOAD_CONFIG.DEFAULT_MAX_SIZE,
    maxFiles = 10,
    onFilesChange,
    onError,
  } = options;

  const [state, setState] = useState<MultiFileUploadState>({
    files: [],
    error: null,
    isLoading: false,
  });

  /**
   * 파일 추가 핸들러
   */
  const handleFilesSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // 최대 파일 개수 체크
      const remainingSlots = maxFiles - state.files.length;
      if (selectedFiles.length > remainingSlots) {
        const error: FileUploadError = {
          code: 'UPLOAD_FAILED',
          message: `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`,
        };
        setState((prev) => ({ ...prev, error, isLoading: false }));
        onError?.(error);
        event.target.value = '';
        return;
      }

      // 각 파일 유효성 검사
      const validFiles: File[] = [];
      for (const file of selectedFiles) {
        const typeValidation = validateFileType(file, allowedTypes);
        if (typeValidation !== true) {
          setState((prev) => ({ ...prev, error: typeValidation, isLoading: false }));
          onError?.(typeValidation);
          event.target.value = '';
          return;
        }

        const sizeValidation = validateFileSize(file, maxSize);
        if (sizeValidation !== true) {
          setState((prev) => ({ ...prev, error: sizeValidation, isLoading: false }));
          onError?.(sizeValidation);
          event.target.value = '';
          return;
        }

        validFiles.push(file);
      }

      const newFiles = [...state.files, ...validFiles];
      setState({
        files: newFiles,
        error: null,
        isLoading: false,
      });

      onFilesChange?.(newFiles);
      event.target.value = '';
    },
    [state.files, allowedTypes, maxSize, maxFiles, onFilesChange, onError]
  );

  /**
   * 특정 파일 제거
   */
  const removeFile = useCallback(
    (index: number): void => {
      setState((prev) => {
        const newFiles = prev.files.filter((_, i) => i !== index);
        onFilesChange?.(newFiles);
        return { ...prev, files: newFiles };
      });
    },
    [onFilesChange]
  );

  /**
   * 모든 파일 제거
   */
  const clearFiles = useCallback((): void => {
    setState({
      files: [],
      error: null,
      isLoading: false,
    });
    onFilesChange?.([]);
  }, [onFilesChange]);

  /**
   * 에러 제거
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    handleFilesSelect,
    removeFile,
    clearFiles,
    clearError,
  };
}
