import { useState } from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import apiClient from '@/shared/api/axios'

interface ReAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  title?: string
  description?: string
  actionLabel?: string
}

export function ReAuthDialog({
  open,
  onOpenChange,
  onSuccess,
  title = 'Security Verification',
  description = 'For your security, please confirm your password to proceed.',
  actionLabel = 'Confirm Action',
}: ReAuthDialogProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setPassword('')
    setError(null)
    onOpenChange(false)
  }

  const handleConfirm = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // We call a verify-password endpoint
      await apiClient.post('/auth/verify-password/', { password })
      onSuccess()
      handleClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid password'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <AlertWithIcon variant="destructive">{error}</AlertWithIcon>}

          <div className="space-y-2">
            <Label htmlFor="reauth-password">Password</Label>
            <Input
              id="reauth-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              autoFocus
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
