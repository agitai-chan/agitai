import { forwardRef, useId } from 'react';
import { Upload, X, File, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/fileUpload';
import { useFileUpload, useMultiFileUpload, type UseFileUploadOptions, type UseMultiFileUploadOptions } from '@/hooks/useFileUpload';

/**
 * 단일 파일 업로드 컴포넌트 Props
 */
export interface FileUploadProps extends Omit<UseFileUploadOptions, 'onFileSelect'> {
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 (외부에서 전달) */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 파일 선택 시 콜백 */
  onFileChange?: (file: File | null) => void;
  /** 초기 미리보기 URL (기존 이미지 표시용) */
  initialPreview?: string | null;
  /** 추가 클래스명 */
  className?: string;
  /** accept 속성 (MIME 타입) */
  accept?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 단일 파일 업로드 컴포넌트
 *
 * 이미지 또는 단일 파일 업로드에 사용합니다.
 *
 * @example
 * ```tsx
 * // 이미지 업로드
 * <FileUpload
 *   label="프로필 이미지"
 *   imageOnly
 *   onFileChange={(file) => setProfileImage(file)}
 * />
 *
 * // 문서 업로드
 * <FileUpload
 *   label="첨부파일"
 *   accept=".pdf,.doc,.docx"
 *   onFileChange={(file) => setAttachment(file)}
 * />
 * ```
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      error: externalError,
      helperText,
      onFileChange,
      initialPreview,
      className,
      accept,
      disabled,
      imageOnly = false,
      allowedTypes,
      maxSize,
      onError,
    },
    ref
  ) => {
    const inputId = useId();

    const {
      file,
      preview,
      error: internalError,
      isLoading,
      handleFileSelect,
      reset,
    } = useFileUpload({
      imageOnly,
      allowedTypes,
      maxSize,
      onFileSelect: onFileChange,
      onError,
    });

    const error = externalError || internalError?.message;
    const displayPreview = preview || initialPreview;

    const handleRemove = () => {
      reset();
      onFileChange?.(null);
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors',
            error
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 hover:border-slate-400',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'cursor-pointer'
          )}
        >
          {/* 미리보기 또는 업로드 영역 */}
          {displayPreview && imageOnly ? (
            <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg">
              <img
                src={displayPreview}
                alt="미리보기"
                className="h-full w-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : file ? (
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-slate-600" />
                ) : (
                  <File className="h-5 w-5 text-slate-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ) : (
            <label
              htmlFor={inputId}
              className={cn(
                'flex flex-col items-center justify-center p-6',
                !disabled && 'cursor-pointer'
              )}
            >
              <Upload className="mb-2 h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                {isLoading ? '처리 중...' : '클릭하여 파일 선택'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {imageOnly
                  ? 'JPG, PNG, GIF, WebP (최대 5MB)'
                  : '파일을 끌어다 놓거나 클릭하세요'}
              </p>
            </label>
          )}

          <input
            ref={ref}
            id={inputId}
            type="file"
            accept={accept || (imageOnly ? 'image/*' : undefined)}
            onChange={handleFileSelect}
            disabled={disabled || isLoading}
            className="hidden"
          />
        </div>

        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

/**
 * 다중 파일 업로드 컴포넌트 Props
 */
export interface MultiFileUploadProps extends UseMultiFileUploadOptions {
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 (외부에서 전달) */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 파일 변경 시 콜백 */
  onFilesChange?: (files: File[]) => void;
  /** 추가 클래스명 */
  className?: string;
  /** accept 속성 (MIME 타입) */
  accept?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 다중 파일 업로드 컴포넌트
 *
 * 여러 파일을 업로드할 때 사용합니다.
 *
 * @example
 * ```tsx
 * <MultiFileUpload
 *   label="첨부파일"
 *   maxFiles={5}
 *   onFilesChange={(files) => setAttachments(files)}
 * />
 * ```
 */
export const MultiFileUpload = forwardRef<HTMLInputElement, MultiFileUploadProps>(
  (
    {
      label,
      error: externalError,
      helperText,
      onFilesChange,
      className,
      accept,
      disabled,
      allowedTypes,
      maxSize,
      maxFiles = 10,
      onError,
    },
    ref
  ) => {
    const inputId = useId();

    const {
      files,
      error: internalError,
      isLoading,
      handleFilesSelect,
      removeFile,
    } = useMultiFileUpload({
      allowedTypes,
      maxSize,
      maxFiles,
      onFilesChange,
      onError,
    });

    const error = externalError || internalError?.message;

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'rounded-lg border-2 border-dashed transition-colors',
            error
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 hover:border-slate-400',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'cursor-pointer'
          )}
        >
          <label
            htmlFor={inputId}
            className={cn(
              'flex flex-col items-center justify-center p-6',
              !disabled && 'cursor-pointer'
            )}
          >
            <Upload className="mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              {isLoading ? '처리 중...' : '클릭하여 파일 선택'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              최대 {maxFiles}개 파일 업로드 가능 ({files.length}/{maxFiles})
            </p>
          </label>

          <input
            ref={ref}
            id={inputId}
            type="file"
            multiple
            accept={accept}
            onChange={handleFilesSelect}
            disabled={disabled || isLoading}
            className="hidden"
          />
        </div>

        {/* 선택된 파일 목록 */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 text-slate-600" />
                  ) : (
                    <File className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

MultiFileUpload.displayName = 'MultiFileUpload';
