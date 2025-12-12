import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { uploadAvatar, deleteAvatar } from '../api/accountApi'
import { toast } from 'sonner'
import { AlertWithIcon } from '@/shared/components/ui/alert'

export function AvatarUpload() {
  const { user, refreshUserProfile } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File size must be less than 10MB.')
      toast.error('File too large.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, or WebP images are allowed.')
      toast.error('Invalid file type.')
      return
    }

    setIsLoading(true)
    try {
      const response = await uploadAvatar(file)
      await refreshUserProfile() // Refresh user data to show new avatar
      toast.success(response.message || 'Profile picture uploaded successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture.')
      toast.error('Failed to upload profile picture.')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Clear file input
      }
    }
  }

  const handleDeleteAvatar = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await deleteAvatar()
      await refreshUserProfile() // Refresh user data to show default avatar
      toast.success(response.message || 'Profile picture deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile picture.')
      toast.error('Failed to delete profile picture.')
    } finally {
      setIsLoading(false)
    }
  }

  const getFallback = () => {
    const initials = user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
    return initials || user?.email?.[0]?.toUpperCase() || '?'
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24 group">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user?.avatar || undefined} alt={user?.name || user?.email} />
          <AvatarFallback>{getFallback()}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          variant="outline"
          className="max-w-max"
        >
          <Camera className="mr-2 h-4 w-4" /> Upload New Photo
        </Button>
        {user?.avatar && (
          <Button
            onClick={handleDeleteAvatar}
            disabled={isLoading}
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 max-w-max"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove Photo
          </Button>
        )}
      </div>

      {error && (
        <AlertWithIcon variant="destructive">
          <XCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </AlertWithIcon>
      )}
    </div>
  )
}
