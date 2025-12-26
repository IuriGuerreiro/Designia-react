import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import { DeleteAccountDialog } from './DeleteAccountDialog'

export function DeleteAccountCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertWithIcon variant="destructive">
            <p className="text-sm">
              <strong>Warning:</strong> This action cannot be undone. All your data, including your
              profile, order history, reviews, and messages will be permanently deleted.
            </p>
          </AlertWithIcon>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Once deleted, your account cannot be recovered.</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}
