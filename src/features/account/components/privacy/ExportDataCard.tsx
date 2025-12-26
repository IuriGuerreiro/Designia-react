import { useState } from 'react'
import { Download, Loader2, Mail, FileJson } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { AlertWithIcon } from '@/shared/components/ui/alert'
import { toast } from 'sonner'
import { exportUserData } from '../../api/accountApi'

export function ExportDataCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRequested, setIsRequested] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await exportUserData()
      setIsRequested(true)
      toast.success(response.message)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request data export'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Export Your Data
        </CardTitle>
        <CardDescription>
          Download a copy of all your personal data (GDPR Right to Data Portability)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Your export will include:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Account information</li>
            <li>Profile data</li>
            <li>Order history</li>
            <li>Reviews you've written</li>
            <li>Messages</li>
            <li>Seller information (if applicable)</li>
          </ul>
        </div>

        {isRequested ? (
          <AlertWithIcon variant="success" className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Export request received!</p>
              <p className="text-sm mt-1">
                We're preparing your data. You'll receive an email with a download link within 5-10
                minutes.
              </p>
            </div>
          </AlertWithIcon>
        ) : (
          <div className="flex items-center gap-4">
            <Button onClick={handleExport} disabled={isLoading} variant="outline">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export My Data
            </Button>
            <span className="text-sm text-muted-foreground">
              You'll receive a download link via email
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
