import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultView?: 'login' | 'register'
}

export function AuthDialog({ open, onOpenChange, defaultView = 'login' }: AuthDialogProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView)

  // Update view when defaultView prop changes
  useEffect(() => {
    setView(defaultView)
  }, [defaultView])

  const handleSuccess = () => {
    onOpenChange(false)
    // Reset to login view for next time
    setTimeout(() => setView('login'), 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {view === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setView('register')} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => setView('login')} />
        )}
      </DialogContent>
    </Dialog>
  )
}
