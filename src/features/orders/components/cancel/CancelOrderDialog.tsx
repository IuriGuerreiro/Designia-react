import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { CancelOrderForm } from './CancelOrderForm'
import { cancelOrder } from '../../api/ordersApi' // Need to implement this
import type { CancelRequestFormValues } from '../../types/cancel'
import type { OrderDetail } from '../../types'

interface CancelOrderDialogProps {
  order: OrderDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelOrderDialog({ order, open, onOpenChange }: CancelOrderDialogProps) {
  const { id: orderId } = useParams<{ id: string }>()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (data: CancelRequestFormValues) => {
    if (!orderId) {
      console.error('Order ID is missing for cancellation.')
      return
    }
    try {
      await cancelOrder(orderId, data)
      setIsSuccess(true)
    } catch (error) {
      console.error('Cancellation failed:', error)
      throw error
    }
  }

  const handleClose = () => {
    setIsSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone. If you
                have already paid, a refund will be processed.
              </DialogDescription>
            </DialogHeader>
            <CancelOrderForm onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Order Cancelled</DialogTitle>
              <DialogDescription className="text-center">
                Your order has been cancelled successfully.
                {order.payment_status === 'paid' && ' A refund has been initiated.'}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="w-full mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
