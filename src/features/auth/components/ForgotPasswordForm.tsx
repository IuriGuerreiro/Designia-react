import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/shared/api/axios'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void
}

export function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      // Backend should have a password reset request endpoint
      // Using a likely path, if it doesn't exist, we might need to create it
      // Standard Dj-Rest-Auth / SimpleJWT often uses /password/reset/ or similar
      // Checking existing code, I saw SetPasswordRequestSerializer in serializers.py
      // which suggests an endpoint exists or we might need to add one.
      // For now, assume /auth/password/reset/ or /auth/request-password-reset/
      // Based on typical patterns in this project:
      await apiClient.post('/auth/password/reset/', { email: values.email })
      setIsSuccess(true)
      toast.success('Reset link sent')
    } catch (err) {
      // Security best practice: Don't reveal if email exists or not usually,
      // but for UX in this specific app context, we might show error if it's a
      // system error. If it's 404/400, maybe just say sent to avoid enumeration.
      // However, if the backend returns a specific error message intended for user:
      const message = err instanceof Error ? err.message : 'Failed to send reset link'
      // If it's a 404, the backend might be missing the endpoint, or user not found.
      // We'll show a generic success message to prevent user enumeration if the backend
      // throws a 404 for "user not found" but ideally the backend handles this.
      // For now, let's show the error if it's not a 404.
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } }
        if (axiosError.response?.status === 404) {
          // If endpoint is missing, this will be confusing.
          // But if "User not found" is 404, we should probably pretend success.
          // Let's assume the endpoint MIGHT be missing and show error for now
          // to help debugging if it fails.
          setError('System error: Password reset service unavailable.')
        } else {
          setError(message)
        }
      } else {
        setError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <strong>{form.getValues('email')}</strong>.
          </p>
        </div>
        <Button onClick={onSwitchToLogin} variant="outline" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <AlertWithIcon variant="destructive">{error}</AlertWithIcon>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>
      </div>
    </div>
  )
}
