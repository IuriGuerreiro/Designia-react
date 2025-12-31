import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
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
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/shared/api/axios'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const email = searchParams.get('email')
  const code = searchParams.get('code')

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (!email || !code) {
      setError('Invalid or incomplete reset link. Please request a new one.')
    }
  }, [email, code])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!email || !code) return

    setIsLoading(true)
    setError(null)

    try {
      await apiClient.post('/auth/password/reset/verify/', {
        email,
        code,
        password: values.password,
        password_confirm: values.confirmPassword,
      })
      setIsSuccess(true)
      toast.success('Password reset successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <div className="w-full max-w-md bg-background p-8 rounded-lg border shadow-sm space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Password Reset Complete</h1>
            <p className="text-muted-foreground">
              Your password has been successfully updated. You can now sign in with your new
              password.
            </p>
          </div>
          <Button asChild className="w-full h-12">
            <Link to="/">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
      <div className="w-full max-w-md bg-background p-8 rounded-lg border shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new password for <strong>{email}</strong>
          </p>
        </div>

        {error ? (
          <div className="space-y-4">
            <AlertWithIcon variant="destructive">{error}</AlertWithIcon>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                    Updating Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
