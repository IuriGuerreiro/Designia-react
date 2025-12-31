import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { useAuthStore } from '../hooks/useAuthStore'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  view: 'login' | 'register' | 'forgot-password'
  onViewChange: (view: 'login' | 'register' | 'forgot-password') => void
}

export function AuthDialog({ open, onOpenChange, onSuccess, view, onViewChange }: AuthDialogProps) {
  const { clearError } = useAuthStore()

  // Clear errors when dialog closes
  useEffect(() => {
    if (!open) {
      clearError()
    }
  }, [open, clearError])

  const handleSuccess = () => {
    clearError()
    // Call parent's success handler if provided, otherwise close normally
    if (onSuccess) {
      onSuccess()
    } else {
      onOpenChange(false)
    }
  }

  const handleSwitchToRegister = () => {
    clearError()
    onViewChange('register')
  }

  const handleSwitchToLogin = () => {
    clearError()
    onViewChange('login')
  }

  const handleSwitchToForgotPassword = () => {
    clearError()
    onViewChange('forgot-password')
  }

  let title = ''
  let description = ''

  switch (view) {
    case 'login':
      title = 'Welcome Back'
      description = 'Sign in to your account to continue'
      break
    case 'register':
      title = 'Create Account'
      description = 'Sign up to start shopping'
      break
    case 'forgot-password':
      title = 'Reset Password'
      description = 'Enter your email to receive a reset link'
      break
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearError()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        {view === 'login' && (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        )}
        {view === 'register' && (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchToLogin} />
        )}
        {view === 'forgot-password' && <ForgotPasswordForm onSwitchToLogin={handleSwitchToLogin} />}
      </DialogContent>
    </Dialog>
  )
}
