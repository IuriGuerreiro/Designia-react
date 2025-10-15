import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './ImageUpload.module.css';

export interface ImageUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedExtensions?: string[];
}

interface FilePreview {
  file: File;
  url: string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const ImageUpload: React.FC<ImageUploadProps> = ({
  files,
  setFiles,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024,
  allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'],
}) => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension) {
      return { isValid: false, error: 'File has no extension' };
    }

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type .${fileExtension} not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
      };
    }

    const validMimeTypes: Record<string, string[]> = {
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      png: ['image/png'],
      webp: ['image/webp'],
    };

    const allowedMimeTypes = validMimeTypes[fileExtension];
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File MIME type ${file.type} doesn't match extension .${fileExtension}`,
      };
    }

    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      };
    }

    return { isValid: true };
  }, [allowedExtensions, maxFileSize]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    if (files.length + acceptedFiles.length > maxFiles) {
      newErrors.push(
        `Cannot upload more than ${maxFiles} files. You have ${files.length} files and tried to add ${acceptedFiles.length} more.`,
      );
      setValidationErrors(newErrors);
      return;
    }

    rejectedFiles.forEach(() => {
      newErrors.push('Some files were rejected by the dropzone. Please ensure they meet the requirements.');
    });

    acceptedFiles.forEach((file) => {
      const { isValid, error } = validateFile(file);
      if (isValid) {
        validFiles.push(file);
      } else if (error) {
        newErrors.push(`${file.name}: ${error}`);
      }
    });

    if (validFiles.length > 0) {
      const uniqueFiles = [...files];
      validFiles.forEach((file) => {
        if (!uniqueFiles.some((existing) => existing.name === file.name && existing.size === file.size)) {
          uniqueFiles.push(file);
        }
      });
      setFiles(uniqueFiles);
    }

    setValidationErrors(newErrors);
  }, [files, maxFiles, setFiles, validateFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: maxFileSize,
  });

  const handleImageError = useCallback((fileName: string) => {
    setImageErrors((prev) => new Set(prev).add(fileName));
  }, []);

  const handleImageLoad = useCallback((fileName: string) => {
    setImageErrors((prev) => {
      if (!prev.has(fileName)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(fileName);
      return next;
    });
  }, []);

  const removeFile = useCallback((fileToRemove: File) => {
    const nextFiles = files.filter((file) => file !== fileToRemove);
    setFiles(nextFiles);
  }, [files, setFiles]);

  useEffect(() => {
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const previewElements = useMemo(() => previews.map((preview, index) => (
    <div className={styles.thumbnail} key={`${preview.file.name}-${index}`}>
      {imageErrors.has(preview.file.name) ? (
        <div className={styles['thumbnail-error']}>
          <span>⚠️</span>
          <p>Preview unavailable</p>
        </div>
      ) : (
        <img
          src={preview.url}
          alt={preview.file.name}
          onError={() => handleImageError(preview.file.name)}
          onLoad={() => handleImageLoad(preview.file.name)}
          loading="lazy"
        />
      )}
      <button
        type="button"
        className={styles['remove-btn']}
        onClick={() => removeFile(preview.file)}
        title={`Remove ${preview.file.name}`}
      >
        ×
      </button>
      <div className={styles['thumbnail-info']}>
        <span className={styles['file-name']} title={preview.file.name}>
          {preview.file.name.length > 15 ? `${preview.file.name.substring(0, 12)}...` : preview.file.name}
        </span>
      </div>
    </div>
  )), [previews, imageErrors, handleImageError, handleImageLoad, removeFile]);

  const dropzoneClassName = cx(styles.dropzone, isDragActive && styles['dropzone-active']);

  return (
    <div className={styles['image-upload-container']}>
      <div {...getRootProps({ className: dropzoneClassName })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <div>
            <p>Drag 'n' drop images here, or click to select files</p>
            <p className={styles['dropzone-hint']}>
              Supported formats: JPG, PNG, WebP • Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB each • Max {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className={styles['validation-errors']}>
          <h4>❌ Upload Errors:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {previewElements.length > 0 && (
        <aside className={styles['thumbnails-container']}>
          <div className={styles['thumbnails-header']}>
            <span>Selected Images ({files.length}/{maxFiles})</span>
            {files.length > 0 && (
              <button
                type="button"
                className={styles['clear-all-btn']}
                onClick={() => setFiles([])}
              >
                Clear All
              </button>
            )}
          </div>
          {previewElements}
        </aside>
      )}
    </div>
  );
};

export default ImageUpload;
