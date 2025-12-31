import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { AlertCircle, RefreshCw, LifeBuoy, Home } from 'lucide-react'

export function ServerErrorPage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-muted/20 select-none">500</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="h-24 w-24 text-destructive opacity-20" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">System Error</h2>
          <p className="text-muted-foreground">
            Something went wrong on our end. We're working on fixing it as fast as we can.
          </p>
        </div>

        <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 text-sm">
          <p className="text-destructive font-medium">
            Please try refreshing the page or come back later.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button onClick={handleRefresh} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <a href="mailto:support@desginia.com">
              <LifeBuoy className="mr-2 h-4 w-4" />
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
