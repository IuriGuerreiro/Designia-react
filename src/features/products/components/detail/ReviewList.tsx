import type { MinimalProductReview } from '@/features/products/types'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Separator } from '@/shared/components/ui/separator'
import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ReviewListProps {
  reviews: MinimalProductReview[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-12 text-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">Customer Reviews</h3>
        <span className="text-sm text-muted-foreground">Based on {reviews.length} reviews</span>
      </div>
      <div className="space-y-8">
        {reviews.map((review, index) => (
          <div key={review.id} className="group">
            <div className="flex gap-4 items-start">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {review.reviewer.username?.slice(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold text-foreground">
                    {review.reviewer.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center text-amber-500 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < review.rating ? 'fill-current' : 'text-muted-foreground/20 fill-none'
                      )}
                    />
                  ))}
                </div>
                {review.title && <h4 className="font-medium text-sm">{review.title}</h4>}
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            </div>
            {index < reviews.length - 1 && <Separator className="mt-8 opacity-50" />}
          </div>
        ))}
      </div>
    </div>
  )
}
