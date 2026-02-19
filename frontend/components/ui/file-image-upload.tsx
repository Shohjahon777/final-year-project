'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export interface FileImageUploadProps {
  /** Current file URL (from server) or empty string */
  value: string
  /** Called with file; return uploaded URL. Component handles loading/error. */
  onUpload: (file: File) => Promise<string>
  /** Called when user clears the file */
  onClear: () => void
  /** Accept string for input, e.g. ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" */
  accept?: string
  /** Max file size in MB */
  maxSizeMB?: number
  disabled?: boolean
  /** Optional error message (e.g. from parent validation) */
  error?: string
  /** When value is a path (e.g. /uploads/xyz.jpg), base URL for image preview (e.g. API origin without /api) */
  valueImageBaseUrl?: string
  /** Accessible label (not visually shown if you use your own label) */
  'aria-label'?: string
  className?: string
}

export const FileImageUpload = React.forwardRef<HTMLDivElement, FileImageUploadProps>(
  (
    {
      value,
      onUpload,
      onClear,
      accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp',
      maxSizeMB = 10,
      disabled = false,
      error: externalError,
      valueImageBaseUrl,
      'aria-label': ariaLabel = 'Upload file or image',
      className,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isDragActive, setIsDragActive] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [previewFile, setPreviewFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

    const displayError = externalError ?? error
    const maxBytes = maxSizeMB * 1024 * 1024

    const clearPreview = React.useCallback(() => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      setPreviewFile(null)
    }, [previewUrl])

    React.useEffect(() => {
      return () => clearPreview()
    }, [clearPreview])

    const validateFile = (file: File): string | null => {
      if (file.size > maxBytes) {
        return `File must be under ${maxSizeMB} MB`
      }
      return null
    }

    const processFile = React.useCallback(
      async (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        setError(null)
        setLoading(true)
        if (IMAGE_TYPES.includes(file.type)) {
          const url = URL.createObjectURL(file)
          setPreviewUrl(url)
          setPreviewFile(file)
        } else {
          setPreviewFile(file)
        }
        try {
          await onUpload(file)
          if (inputRef.current) inputRef.current.value = ''
          setPreviewFile(null)
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return null
          })
          // Parent sets value to returned URL; we show uploaded state via value prop
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Upload failed'
          setError(message)
        } finally {
          setLoading(false)
        }
      },
      [onUpload, maxBytes, maxSizeMB]
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      processFile(file)
      e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragActive(false)
      if (disabled || loading) return
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !loading) setIsDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)
    }

    const handleClear = () => {
      clearPreview()
      setError(null)
      onClear()
      if (inputRef.current) inputRef.current.value = ''
    }

    const hasValue = !!value || !!previewFile
    const isImage = previewFile && IMAGE_TYPES.includes(previewFile.type)
    const valueAsImageUrl =
      value && /\.(jpe?g|png|gif|webp)$/i.test(value)
        ? value.startsWith('http')
          ? value
          : valueImageBaseUrl
            ? `${valueImageBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')}${value.startsWith('/') ? value : `/${value}`}`
            : value
        : null
    const displayPreviewUrl = previewUrl ?? valueAsImageUrl

    return (
      <div ref={ref} className={cn('space-y-2', className)} aria-label={ariaLabel}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || loading}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
        />

        {!hasValue && !loading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            disabled={disabled}
            className={cn(
              'w-full min-h-[180px] rounded-xl border-2 border-dashed transition-all duration-200',
              'flex flex-col items-center justify-center gap-3 p-6',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
              'border-gray-300 dark:border-gray-600',
              'bg-gray-50 dark:bg-gray-800/50',
              'hover:border-primary-400 hover:bg-primary-50/50 dark:hover:border-primary-500 dark:hover:bg-primary-900/10',
              isDragActive && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                'bg-gray-200 dark:bg-gray-700',
                'group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30',
                isDragActive && 'bg-primary-100 dark:bg-primary-900/30'
              )}
            >
              <Upload className="h-7 w-7 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragActive ? 'Drop file here' : 'Drag and drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, images up to {maxSizeMB} MB
              </p>
            </div>
          </button>
        )}

        {(hasValue || loading) && (
          <div
            className={cn(
              'relative rounded-xl border overflow-hidden transition-colors',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900'
            )}
          >
            {loading && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/90 dark:bg-gray-900/90"
                aria-busy
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading…</span>
              </div>
            )}

            <div className="flex items-stretch gap-0">
              {displayPreviewUrl ? (
                <div className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={displayPreviewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {previewFile ? (
                    <FileText className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {previewFile?.name ?? (value ? value.replace(/^.*\//, '') : 'File')}
                </p>
                {!loading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    {value ? 'Uploaded — will be attached to submission' : 'Selected — upload in progress'}
                  </p>
                )}
                {!loading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="mt-2 h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {displayError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {displayError}
          </p>
        )}
      </div>
    )
  }
)
FileImageUpload.displayName = 'FileImageUpload'
