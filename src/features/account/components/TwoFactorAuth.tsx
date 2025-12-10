import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import {
  getAccountStatus,
  send2FACode,
  enable2FA,
  disable2FA,
} from '@/features/auth/api/authApiReal'
import { toast } from 'sonner'

export function TwoFactorAuth() {
  const { user, refreshUserProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      setIsCheckingStatus(true)
      try {
        const status = await getAccountStatus()
        setIsEnabled(status.two_factor_enabled)
      } catch (err) {
        console.error('Failed to check 2FA status:', err)
        // Fallback to user object if API fails, though API is preferred
        setIsEnabled(user?.two_factor_enabled ?? false)
      } finally {
        setIsCheckingStatus(false)
      }
    }
    checkStatus()
  }, [user])

  const handleInitiate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const purpose = isEnabled ? 'disable_2fa' : 'enable_2fa'
      await send2FACode(purpose)
      setIsVerifyOpen(true)
      toast.success('Verification code sent to your email')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send verification code'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      if (isEnabled) {
        await disable2FA(code)
        toast.success('Two-factor authentication disabled')
        setIsEnabled(false)
      } else {
        await enable2FA(code)
        toast.success('Two-factor authentication enabled')
        setIsEnabled(true)
      }
      setIsVerifyOpen(false)
      setCode('')
      // Refresh user profile to update global state
      await refreshUserProfile()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed'
      setError(msg)
      // Don't close modal on error so user can retry
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsVerifyOpen(false)
    setCode('')
    setError(null)
  }

  if (isCheckingStatus && isEnabled === null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking security status...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {isEnabled ? (
              <ShieldCheck className="h-6 w-6 text-green-600" />
            ) : (
              <Shield className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="font-medium flex items-center gap-2">
              {isEnabled ? 'Two-Factor Authentication is ON' : 'Two-Factor Authentication is OFF'}
              {isEnabled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </h4>
            <p className="text-sm text-muted-foreground max-w-lg">
              {isEnabled
                ? 'Your account is protected. You will be asked for a verification code from your email when you sign in.'
                : "Add an extra layer of security to your account. When enabled, we will send a verification code to your email to confirm it's really you signing in."}
            </p>
          </div>
        </div>

        <Button
          variant={isEnabled ? 'outline' : 'default'}
          onClick={handleInitiate}
          disabled={isLoading}
          className={
            isEnabled
              ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
              : ''
          }
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Button>
      </div>

      <Dialog open={isVerifyOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm {isEnabled ? 'Deactivation' : 'Activation'}</DialogTitle>
            <DialogDescription>
              Please enter the 6-digit code sent to <strong>{user?.email}</strong> to confirm this
              change.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && <AlertWithIcon variant="destructive">{error}</AlertWithIcon>}

            <div className="flex justify-center">
              <Input
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                className="font-mono text-2xl tracking-[0.5em] text-center w-48 h-12"
                maxLength={6}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={isLoading || code.length !== 6}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & {isEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
