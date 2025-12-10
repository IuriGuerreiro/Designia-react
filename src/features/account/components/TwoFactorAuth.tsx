import { useState } from 'react'
import { Shield, ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { AlertWithIcon } from '@/shared/components/ui/alert'

export function TwoFactorAuth() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleEnable2FA = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // TODO: Implement 2FA enable API call
      console.log('Enabling 2FA...')
      // Placeholder for now
      setSuccess('2FA will be enabled in a future update')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // TODO: Implement 2FA disable API call
      console.log('Disabling 2FA...')
      // Placeholder for now
      setSuccess('2FA will be disabled in a future update')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const is2FAEnabled = user?.two_factor_enabled || false

  return (
    <div className="space-y-4">
      {error && <AlertWithIcon variant="destructive">{error}</AlertWithIcon>}
      {success && <AlertWithIcon variant="success">{success}</AlertWithIcon>}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {is2FAEnabled ? (
              <ShieldCheck className="h-6 w-6 text-green-600" />
            ) : (
              <Shield className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">
              {is2FAEnabled ? 'Two-Factor Authentication Enabled' : 'Enable Two-Factor Authentication'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {is2FAEnabled
                ? 'Your account is protected with two-factor authentication. You will receive a verification code via email when signing in.'
                : 'Protect your account with an additional layer of security. When enabled, you will need to enter a verification code sent to your email each time you sign in.'}
            </p>
          </div>
        </div>

        <div>
          {is2FAEnabled ? (
            <Button
              variant="outline"
              onClick={handleDisable2FA}
              disabled={isLoading}
              className="ml-4"
            >
              {isLoading ? 'Processing...' : 'Disable 2FA'}
            </Button>
          ) : (
            <Button
              onClick={handleEnable2FA}
              disabled={isLoading}
              className="ml-4"
            >
              {isLoading ? 'Processing...' : 'Enable 2FA'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
