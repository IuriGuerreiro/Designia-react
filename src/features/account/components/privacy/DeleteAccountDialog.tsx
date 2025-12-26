import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { deleteAccount } from '../../api/accountApi'
import { toast } from 'sonner'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'warning' | 'confirm' | 'password'

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [step, setStep] = useState<Step>('warning')
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setStep('warning')
    setConfirmation('')
    setPassword('')
    setError(null)
    onOpenChange(false)
  }

  const handleNextStep = () => {
    if (step === 'warning') {
      setStep('confirm')
    } else if (step === 'confirm') {
      if (confirmation !== 'DELETE') {
        setError('Please type DELETE exactly to confirm')
        return
      }
      setError(null)
      setStep('password')
    }
  }

  const handleDelete = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await deleteAccount({
        confirmation: 'DELETE',
        password,
      })

      toast.success('Account deleted successfully')
      await logout()
      handleClose()
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'warning':
        return (
          <div className="space-y-4">
            <AlertWithIcon variant="destructive">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">This action is irreversible!</p>
                  <p className="text-sm mt-1">
                    Once you delete your account, there is no going back.
                  </p>
                </div>
              </div>
            </AlertWithIcon>

            <div className="text-sm space-y-2">
              <p className="font-medium">What will happen:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Your profile and personal information will be permanently deleted</li>
                <li>Your reviews will be anonymized (shown as "Deleted User")</li>
                <li>Your messages will be permanently deleted</li>
                <li>Your order history will no longer be accessible</li>
                <li>If you're a seller, your listings will be removed</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleNextStep}>
                I understand, continue
              </Button>
            </div>
          </div>
        )

      case 'confirm':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To confirm deletion, please type <strong>DELETE</strong> below:
            </p>

            {error && <AlertWithIcon variant="destructive">{error}</AlertWithIcon>}

            <div className="space-y-2">
              <Label htmlFor="confirmation">Type DELETE to confirm</Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setStep('warning')}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleNextStep}
                disabled={confirmation !== 'DELETE'}
              >
                Continue
              </Button>
            </div>
          </div>
        )

      case 'password':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your password for <strong>{user?.email}</strong> to permanently delete your
              account:
            </p>

            {error && <AlertWithIcon variant="destructive">{error}</AlertWithIcon>}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setStep('confirm')} disabled={isLoading}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </>
                )}
              </Button>
            </div>
          </div>
        )
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'warning':
        return 'Delete Account'
      case 'confirm':
        return 'Confirm Deletion'
      case 'password':
        return 'Final Verification'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'warning':
        return 'Please read carefully before proceeding'
      case 'confirm':
        return 'Step 2 of 3: Type confirmation'
      case 'password':
        return 'Step 3 of 3: Verify your identity'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}
