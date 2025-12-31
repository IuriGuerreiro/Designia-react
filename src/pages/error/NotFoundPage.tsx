import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Search, Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-muted/20 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-24 w-24 text-primary opacity-20" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg border border-border text-sm">
          <p className="font-medium mb-2">Try searching for something else:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button size="sm">Search</Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild variant="default">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
