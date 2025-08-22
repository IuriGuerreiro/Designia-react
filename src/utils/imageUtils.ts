/**
 * Image utility functions for file processing and validation
 */

export interface ImageInfo {
  originalFile: File;
  encodedFile: Blob;
  encoding: string;
  quality: number;
  originalSize: number;
  encodedSize: number;
  compressionRatio: number;
}

export interface EncodingOptions {
  maxSizeBytes?: number;
  targetQuality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Encode and compress image before sending to backend
 */
export const encodeImageForUpload = async (
  file: File, 
  options: EncodingOptions = {}
): Promise<ImageInfo> => {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    targetQuality = 0.8,
    format = 'jpeg',
    maxWidth = 2048,
    maxHeight = 2048
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Start with target quality
        let quality = targetQuality;
        let encodedBlob: Blob | null = null;

        const tryCompress = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to encode image'));
                return;
              }

              // If size is acceptable or quality is at minimum, use this blob
              if (blob.size <= maxSizeBytes || currentQuality <= 0.1) {
                const result: ImageInfo = {
                  originalFile: file,
                  encodedFile: blob,
                  encoding: format,
                  quality: currentQuality,
                  originalSize: file.size,
                  encodedSize: blob.size,
                  compressionRatio: file.size / blob.size
                };
                resolve(result);
                return;
              }

              // If still too large, reduce quality and try again
              if (blob.size > maxSizeBytes && currentQuality > 0.1) {
                tryCompress(currentQuality - 0.1);
                return;
              }

              // Fallback - use current blob even if large
              const result: ImageInfo = {
                originalFile: file,
                encodedFile: blob,
                encoding: format,
                quality: currentQuality,
                originalSize: file.size,
                encodedSize: blob.size,
                compressionRatio: file.size / blob.size
              };
              resolve(result);
            },
            `image/${format}`,
            currentQuality
          );
        };

        tryCompress(quality);

      } catch (error) {
        reject(new Error(`Image processing failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file before processing
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension .${extension} not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${maxSize / 1024 / 1024}MB`
    };
  }

  // Block GIF files explicitly
  if (file.type === 'image/gif' || extension === 'gif') {
    return {
      valid: false,
      error: 'GIF files are not supported'
    };
  }

  return { valid: true };
};

/**
 * Detect image encoding from file content
 */
export const detectImageEncoding = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        reject(new Error('Failed to read file'));
        return;
      }

      const bytes = new Uint8Array(arrayBuffer.slice(0, 12));
      
      // Check file signatures
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        resolve('jpeg');
      } else if (
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
        bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
      ) {
        resolve('png');
      } else if (
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      ) {
        resolve('webp');
      } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        reject(new Error('GIF files are not supported'));
      } else {
        reject(new Error('Unknown or unsupported image format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file for encoding detection'));
    };

    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

/**
 * Process multiple images for upload
 */
export const processImagesForUpload = async (
  files: File[],
  options: EncodingOptions = {}
): Promise<ImageInfo[]> => {
  const results: ImageInfo[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      // Validate file first
      const validation = validateImageFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Detect and validate encoding
      const encoding = await detectImageEncoding(file);
      
      // Process image
      const imageInfo = await encodeImageForUpload(file, {
        ...options,
        format: encoding as 'jpeg' | 'png' | 'webp'
      });
      
      results.push(imageInfo);
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Image processing errors:\n${errors.join('\n')}`);
  }

  return results;
};