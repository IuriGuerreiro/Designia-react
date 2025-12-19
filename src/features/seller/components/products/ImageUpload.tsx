import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface ProductImage {
  id?: number
  image?: string
  image_content?: string
  preview?: string
  is_primary: boolean
}

interface ImageUploadProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Process files to base64
      const newImages = [...images]

      acceptedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          newImages.push({
            image_content: base64,
            preview: base64, // For display
            filename: file.name,
            is_primary: newImages.length === 0, // First image is primary
          })
          // Update state after each read (or promise.all would be better but this is simple)
          onChange([...newImages])
        }
        reader.readAsDataURL(file)
      })
    },
    [images, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // Ensure one is primary if any exist
    if (newImages.length > 0 && !newImages.some(i => i.is_primary)) {
      newImages[0].is_primary = true
    }
    onChange(newImages)
  }

  const setPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }))
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-background rounded-full border">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group border rounded-md overflow-hidden aspect-square bg-muted"
            >
              <img
                src={img.preview || img.image}
                alt="Product"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={e => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  {img.is_primary ? (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={e => {
                        e.stopPropagation()
                        setPrimary(index)
                      }}
                    >
                      Make Primary
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
