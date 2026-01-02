import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ReviewForm } from './ReviewForm'
import { createReview, updateReview, deleteReview, getProductReviews } from '../api/reviewService'
import { Button } from '@/shared/components/ui/button'
import { ReviewUserMeta } from './ReviewUserMeta'
import { StarRating } from '@/shared/components/ui/star-rating'
import { VerifiedBadge } from './VerifiedBadge'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog'
import type { CreateReviewPayload, Review } from '../types'

interface ProductReviewsProps {
  productId: string
  productSlug: string
  onReviewSubmitted?: () => void
}

export function ProductReviews({ productId, productSlug, onReviewSubmitted }: ProductReviewsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null)

  // Note: specific user info should come from AuthContext in a real app
  // Using placeholders for optimistic UI
  const currentUser = { id: 'current-user', username: 'You' }

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await getProductReviews(productSlug)
        setReviews(response.results)
      } catch (error) {
        console.error('Failed to load reviews:', error)
        // Optionally show a quiet error or empty state
      } finally {
        setIsLoading(false)
      }
    }

    if (productSlug) {
      loadReviews()
    }
  }, [productSlug])

  const handleSubmitReview = async (data: CreateReviewPayload) => {
    if (editingReview) {
      await handleUpdateReview(data)
    } else {
      await handleCreateReview(data)
    }
  }

  // ... (handleCreateReview and handleUpdateReview remain the same) ...

  const handleCreateReview = async (data: CreateReviewPayload) => {
    // 1. Create Optimistic Review
    const tempId = Date.now()
    const optimisticReview: Review = {
      id: tempId,
      product: { id: productId, name: '' },
      reviewer: currentUser,
      rating: data.rating,
      title: data.title,
      comment: data.comment || '',
      is_verified_purchase: true, // Optimistically assume verified if allowing submit
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 2. Update UI Immediately
    setReviews(prev => [optimisticReview, ...prev])
    setIsFormOpen(false)
    const toastId = toast.loading('Submitting review...')

    try {
      // 3. API Call
      const realReview = await createReview(productSlug, data)

      // 4. Success: Replace temp with real
      setReviews(prev => prev.map(r => (r.id === tempId ? realReview : r)))
      toast.dismiss(toastId)
      toast.success('Review submitted successfully!')
      onReviewSubmitted?.()
    } catch (error: unknown) {
      console.error(error)
      // 5. Error: Revert optimistic update
      setReviews(prev => prev.filter(r => r.id !== tempId))
      setIsFormOpen(true) // Re-open form

      toast.dismiss(toastId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any
      const isPermissionError = err.response?.status === 403
      const isBadRequest = err.response?.status === 400

      let title = 'Failed to submit review'
      let description = 'Please check your connection and try again.'

      if (isPermissionError) {
        title = 'Verified Purchase Required'
        description = 'You need to purchase this product to leave a review.'
      } else if (isBadRequest && err.response?.data?.detail) {
        title = 'Cannot Submit Review'
        description = err.response.data.detail
      }

      toast.error(title, {
        description: description,
        action: {
          label: 'Retry',
          onClick: () => handleCreateReview(data),
        },
      })
    }
  }

  const handleUpdateReview = async (data: CreateReviewPayload) => {
    if (!editingReview) return

    // 1. Optimistic Update
    const originalReview = editingReview
    const optimisticReview: Review = {
      ...originalReview,
      rating: data.rating,
      title: data.title,
      comment: data.comment || '',
      updated_at: new Date().toISOString(),
    }

    setReviews(prev => prev.map(r => (r.id === originalReview.id ? optimisticReview : r)))
    setIsFormOpen(false)
    setEditingReview(null)
    const toastId = toast.loading('Updating review...')

    try {
      // 2. API Call
      const updatedReview = await updateReview(originalReview.id, data)

      // 3. Success: Confirm update with real data
      setReviews(prev => prev.map(r => (r.id === originalReview.id ? updatedReview : r)))
      toast.dismiss(toastId)
      toast.success('Review updated successfully!')
    } catch (error) {
      console.error(error)
      // 4. Error: Revert to original
      setReviews(prev => prev.map(r => (r.id === originalReview.id ? originalReview : r)))
      setEditingReview(originalReview)
      setIsFormOpen(true)

      toast.dismiss(toastId)
      toast.error('Failed to update review', {
        description: 'Please check your connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => handleUpdateReview(data),
        },
      })
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return

    // 1. Optimistic Update
    const originalReviews = reviews
    setReviews(prev => prev.filter(r => r.id !== deleteReviewId))
    setDeleteReviewId(null) // Close modal immediately

    const toastId = toast.loading('Deleting review...')

    try {
      await deleteReview(deleteReviewId)
      toast.dismiss(toastId)
      toast.success('Review deleted successfully')
    } catch {
      // Revert
      setReviews(originalReviews)
      toast.dismiss(toastId)
      toast.error('Failed to delete review')
    }
  }

  const startEdit = (review: Review) => {
    setEditingReview(review)
    setIsFormOpen(true)
  }

  const cancelEdit = () => {
    setEditingReview(null)
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Customer Reviews</h3>
        {!isFormOpen && <Button onClick={() => setIsFormOpen(true)}>Write a Review</Button>}
      </div>

      {isFormOpen && (
        <div className="bg-muted/30 p-6 rounded-lg border animate-in fade-in slide-in-from-top-2">
          <h4 className="font-semibold mb-4">{editingReview ? 'Edit Review' : 'Write a Review'}</h4>
          <ReviewForm
            productId={productId}
            initialData={
              editingReview
                ? {
                    rating: editingReview.rating,
                    title: editingReview.title,
                    comment: editingReview.comment,
                  }
                : undefined
            }
            onSubmit={handleSubmitReview}
            onCancel={cancelEdit}
            className="max-w-2xl"
          />
        </div>
      )}

      <div className="space-y-6 mt-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map(review => (
            <div
              key={review.id}
              className="p-6 border rounded-lg bg-card animate-in fade-in slide-in-from-bottom-2 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <ReviewUserMeta
                    username={review.reviewer?.username || 'Anonymous'}
                    createdAt={review.created_at}
                  />
                  {review.is_verified_purchase && <VerifiedBadge />}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(review)}
                    title="Edit Review"
                  >
                    <Pencil size={16} className="text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteReviewId(review.id)}
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRating value={review.rating} readOnly size={16} />
                {review.title && <h4 className="font-semibold text-sm">{review.title}</h4>}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12 border rounded-lg border-dashed bg-muted/10">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteReviewId}
        onOpenChange={open => !open && setDeleteReviewId(null)}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteReview}
      />
    </div>
  )
}
