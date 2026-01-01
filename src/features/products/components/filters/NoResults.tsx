import { Search, RefreshCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface NoResultsProps {
  searchQuery?: string
  hasFilters: boolean
  onClearFilters: () => void
}

export function NoResults({ searchQuery, hasFilters, onClearFilters }: NoResultsProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="rounded-full bg-muted p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>

      <h2 className="text-2xl font-semibold mb-2">No products found</h2>

      <p className="text-muted-foreground mb-6 max-w-md">
        {searchQuery ? (
          <>
            We couldn't find any products matching{' '}
            <span className="font-semibold">"{searchQuery}"</span>
            {hasFilters && ' with your current filters'}
          </>
        ) : (
          <>No products match your current filters</>
        )}
      </p>

      {hasFilters && (
        <div className="space-y-3">
          <Button onClick={onClearFilters} size="lg">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
          <p className="text-sm text-muted-foreground">Try adjusting or removing some filters</p>
        </div>
      )}

      {!hasFilters && searchQuery && (
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium">Suggestions:</p>
          <ul className="space-y-1">
            <li>• Check your spelling</li>
            <li>• Try more general keywords</li>
            <li>• Use different search terms</li>
          </ul>
        </div>
      )}
    </div>
  )
}
