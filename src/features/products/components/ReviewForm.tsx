import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { StarRating } from '@/shared/components/ui/star-rating'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { CreateReviewPayload } from '../types'
import { cn } from '@/shared/lib/utils'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating'),
  title: z.string().max(100, 'Title is too long').optional(),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  productId: string
  initialData?: Partial<CreateReviewPayload>
  onSubmit: (data: CreateReviewPayload) => void
  onCancel: () => void
  isSubmitting?: boolean
  className?: string
}

export function ReviewForm({
  productId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialData?.rating || 0,
      title: initialData?.title || '',
      comment: initialData?.comment || '',
    },
  })

  const commentValue = watch('comment')
  const characterCount = commentValue.length
  const maxChars = 1000

  const handleFormSubmit = (data: ReviewFormData) => {
    onSubmit({
      product_id: productId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} size={24} id="rating" />
          )}
        />
        {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          placeholder="Summary of your experience"
          {...register('title')}
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Review</Label>
        <Textarea
          id="comment"
          placeholder="Tell us what you liked or disliked..."
          className="min-h-[120px]"
          {...register('comment')}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {errors.comment ? (
              <span className="text-destructive">{errors.comment.message}</span>
            ) : null}
          </span>
          <span className={characterCount > maxChars ? 'text-destructive' : ''}>
            {characterCount}/{maxChars}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  )
}
