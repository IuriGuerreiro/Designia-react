import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { uploadAvatar } from '../api/accountApi'
import { toast } from 'sonner'

export function AvatarUpload() {
  const { user, checkAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials =
    user?.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsLoading(true)

    try {
      const response = await uploadAvatar(file)
      await checkAuth() // Refresh user data
      toast.success(response.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={isLoading}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          {isLoading ? 'Uploading...' : 'Change Photo'}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
      </div>
    </div>
  )
}
