import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { useAuthStore } from '../hooks/useAuthStore'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultView?: 'login' | 'register'
}

export function AuthDialog({ open, onOpenChange, defaultView = 'login' }: AuthDialogProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView)
  const { clearError } = useAuthStore()

  // Update view when defaultView prop changes
  useEffect(() => {
    setView(defaultView)
    clearError()
  }, [defaultView, clearError])

  // Clear errors when dialog closes
  useEffect(() => {
    if (!open) {
      clearError()
    }
  }, [open, clearError])

  const handleSuccess = () => {
    onOpenChange(false)
    clearError()
    // Reset to login view for next time
    setTimeout(() => setView('login'), 300)
  }

  const handleSwitchToRegister = () => {
    clearError()
    setView('register')
  }

  const handleSwitchToLogin = () => {
    clearError()
    setView('login')
  }

  const title = view === 'login' ? 'Welcome Back' : 'Create Account'
  const description =
    view === 'login' ? 'Sign in to your account to continue' : 'Sign up to start shopping'

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
        {view === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={handleSwitchToRegister} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchToLogin} />
        )}
      </DialogContent>
    </Dialog>
  )
}
