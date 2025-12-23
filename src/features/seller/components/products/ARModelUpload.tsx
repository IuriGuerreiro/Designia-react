import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, FileBox } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface ARModelData {
  filename?: string
  content?: string // Base64
  url?: string
}

interface ARModelUploadProps {
  value?: ARModelData | null
  onChange: (value: ARModelData | null | undefined) => void
}

export function ARModelUpload({ value, onChange }: ARModelUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        onChange({
          filename: file.name,
          content: base64,
        })
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
    },
    maxFiles: 1,
  })

  return (
    <div className="space-y-4">
      {!value?.filename ? (
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
            <p className="text-sm font-medium">Upload AR Model</p>
            <p className="text-xs text-muted-foreground">GLB, GLTF up to 50MB</p>
          </div>
        </div>
      ) : (
        <div className="relative group border rounded-md overflow-hidden p-4 bg-muted flex items-center gap-4">
          <div className="p-2 bg-background rounded-md border">
            <FileBox className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.filename}</p>
            <p className="text-xs text-muted-foreground">AR Model</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onChange(null)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
