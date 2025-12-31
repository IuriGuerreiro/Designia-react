import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
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
import { useAuthStore } from '../hooks/useAuthStore'
import { getErrorMessage } from '@/shared/utils/errorHandler'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must be numbers only'),
})

type LoginFormValues = z.infer<typeof loginSchema>
type TwoFactorFormValues = z.infer<typeof twoFactorSchema>

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  onSwitchToForgotPassword?: () => void
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginFormProps) {
  const { login, verify2FA, loginWithGoogle, isLoading, error, clearError, pending2FAUserId } =
    useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const form2FA = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  // Clear errors when component unmounts or when switching views
  useEffect(() => {
    return () => {
      setServerError(null)
      clearError()
    }
  }, [clearError])

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    clearError()

    try {
      const response = await login(values)
      if (response.requires_2fa) {
        toast.info(response.message || 'Please enter the verification code sent to your email.')
        // pending2FAUserId from the store now drives the conditional rendering below.
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const on2FASubmit = async (values: TwoFactorFormValues) => {
    setServerError(null)
    clearError()

    try {
      await verify2FA(values.code)
      toast.success('Login successful')
      onSuccess?.()
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setServerError(null)
    clearError()

    if (!credentialResponse.credential) {
      setServerError('Failed to get Google credentials')
      return
    }

    try {
      await loginWithGoogle(credentialResponse.credential)
      onSuccess?.()
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const handleGoogleError = () => {
    setServerError('Google login failed. Please try again.')
  }

  if (pending2FAUserId) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Please enter the 6-digit code sent to your email.
          </p>
        </div>

        {(serverError || error) && (
          <AlertWithIcon variant="destructive">{serverError || error}</AlertWithIcon>
        )}

        <Form {...form2FA}>
          <form onSubmit={form2FA.handleSubmit(on2FASubmit)} className="space-y-4">
            <FormField
              control={form2FA.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000000"
                      className="font-mono text-2xl tracking-[0.5em] text-center h-12"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                      autoFocus
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
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {(serverError || error) && (
        <AlertWithIcon variant="destructive">{serverError || error}</AlertWithIcon>
      )}

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  {onSwitchToForgotPassword && (
                    <button
                      type="button"
                      onClick={onSwitchToForgotPassword}
                      className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          text="signin_with"
          shape="rectangular"
          width="384"
        />
      </div>

      {onSwitchToRegister && (
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#0f172a] hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      )}
    </div>
  )
}
