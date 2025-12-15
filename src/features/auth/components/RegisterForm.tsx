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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register: registerUser, loginWithGoogle, isLoading, error, clearError } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Clear errors when component unmounts or when switching views
  useEffect(() => {
    return () => {
      setServerError(null)
      setSuccessMessage(null)
      clearError()
    }
  }, [clearError])

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    setSuccessMessage(null)
    clearError()

    try {
      const response = await registerUser(values)
      // Show success message - user needs to verify email
      setSuccessMessage(response.message)
      // Optionally call onSuccess to switch to login view after a delay
      setTimeout(() => {
        onSwitchToLogin?.()
      }, 3000)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setServerError(null)
    setSuccessMessage(null)
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
    setServerError('Google sign up failed. Please try again.')
  }

  return (
    <div className="space-y-6">
      {successMessage && <AlertWithIcon variant="success">{successMessage}</AlertWithIcon>}

      {(serverError || error) && (
        <AlertWithIcon variant="destructive">{serverError || error}</AlertWithIcon>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="John Doe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
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
                Creating account...
              </>
            ) : (
              'Create Account'
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
          text="signup_with"
          shape="rectangular"
          width="384"
        />
      </div>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#0f172a] hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  )
}
