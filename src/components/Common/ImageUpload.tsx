import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageUpload.css';

interface ImageUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedExtensions?: string[];
}

interface FilePreview {
  file: File;
  url: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  files, 
  setFiles, 
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'] // No GIF support
}) => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate file extension and type
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension) {
      return { isValid: false, error: 'File has no extension' };
    }

    // Check if extension is allowed
    if (!allowedExtensions.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `File type .${fileExtension} not allowed. Allowed types: ${allowedExtensions.join(', ')}` 
      };
    }

    // Validate MIME type matches extension
    const validMimeTypes = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'webp': ['image/webp']
    };

    const allowedMimeTypes = validMimeTypes[fileExtension as keyof typeof validMimeTypes];
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: `File MIME type ${file.type} doesn't match extension .${fileExtension}` 
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return { 
        isValid: false, 
        error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB` 
      };
    }

    return { isValid: true };
  }, [allowedExtensions, maxFileSize]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check if adding files would exceed maxFiles limit
    if (files.length + acceptedFiles.length > maxFiles) {
      newErrors.push(`Cannot upload more than ${maxFiles} files. You have ${files.length} files and tried to add ${acceptedFiles.length} more.`);
      setValidationErrors(newErrors);
      return;
    }

    // Validate each accepted file
    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      const { file, errors } = rejection;
      const errorMessages = errors.map((e: any) => {
        switch (e.code) {
          case 'file-too-large':
            return `File too large (max ${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`;
          case 'file-invalid-type':
            return `Invalid file type (allowed: ${allowedExtensions.join(', ')})`;
          default:
            return e.message;
        }
      }).join(', ');
      newErrors.push(`${file.name}: ${errorMessages}`);
    });

    setValidationErrors(newErrors);
    
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
    }
  }, [files, setFiles, validateFile, maxFiles, maxFileSize, allowedExtensions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
      // Explicitly removed 'image/gif': ['.gif']
    },
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: true
  });

  // Create and manage object URLs for file previews
  useEffect(() => {
    const newPreviews: FilePreview[] = files.map(file => {
      const existingPreview = previews.find(p => p.file === file);
      if (existingPreview) {
        return existingPreview;
      }
      return {
        file,
        url: URL.createObjectURL(file)
      };
    });

    // Revoke URLs for files that are no longer in the list
    previews.forEach(preview => {
      if (!files.includes(preview.file)) {
        URL.revokeObjectURL(preview.url);
      }
    });

    setPreviews(newPreviews);
  }, [files]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  const removeFile = useCallback((fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
    setImageErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(fileToRemove.name);
      return newErrors;
    });
    // Clear validation errors when files are removed
    setValidationErrors([]);
  }, [files, setFiles]);

  const handleImageError = useCallback((fileName: string) => {
    setImageErrors(prev => new Set(prev).add(fileName));
  }, []);

  const handleImageLoad = useCallback((fileName: string) => {
    setImageErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(fileName);
      return newErrors;
    });
  }, []);

  const previewElements = useMemo(() => 
    previews.map((preview, index) => {
      const hasError = imageErrors.has(preview.file.name);
      
      return (
        <div className="thumbnail" key={`${preview.file.name}-${index}`}>
          {hasError ? (
            <div className="thumbnail-error">
              <span>⚠️</span>
              <p>Failed to load image</p>
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
            className="remove-btn" 
            onClick={() => removeFile(preview.file)}
            title={`Remove ${preview.file.name}`}
          >
            ×
          </button>
          <div className="thumbnail-info">
            <span className="file-name" title={preview.file.name}>
              {preview.file.name.length > 15 
                ? `${preview.file.name.substring(0, 12)}...` 
                : preview.file.name
              }
            </span>
          </div>
        </div>
      );
    }), [previews, imageErrors, handleImageError, handleImageLoad, removeFile]);

  return (
    <div className="image-upload-container">
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <div>
            <p>Drag 'n' drop images here, or click to select files</p>
            <p className="dropzone-hint">
              Supported formats: JPG, PNG, WebP • Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB each • Max {maxFiles} files
            </p>
          </div>
        )}
      </div>
      
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>❌ Upload Errors:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {previewElements.length > 0 && (
        <aside className="thumbnails-container">
          <div className="thumbnails-header">
            <span>Selected Images ({files.length}/{maxFiles})</span>
            {files.length > 0 && (
              <button 
                type="button" 
                className="clear-all-btn"
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
