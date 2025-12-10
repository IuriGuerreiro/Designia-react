import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import { verifyEmail } from '../api/authApiReal'

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link. Missing token.')
        return
      }

      try {
        const response = await verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage(
          err instanceof Error
            ? err.message
            : 'Verification failed. The link may be invalid or expired.'
        )
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            DESGINIA
          </Link>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <h2 className="text-xl font-semibold">Verifying Email...</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold">Email Verified!</h2>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={() => navigate('/')} className="w-full mt-4">
                Go to Home
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Verification Failed</h2>
              <AlertWithIcon variant="destructive" showIcon={false}>
                {message}
              </AlertWithIcon>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full mt-4">
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
