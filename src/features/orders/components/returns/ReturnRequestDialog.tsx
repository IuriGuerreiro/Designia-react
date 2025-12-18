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
import { ReturnRequestForm } from './ReturnRequestForm'
import { createReturnRequest } from '../../api/ordersApi' // NEW IMPORT
import type { ReturnRequestFormValues } from '../../types/return'
import type { OrderDetail } from '../../types'

interface ReturnRequestDialogProps {
  order: OrderDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReturnRequestDialog({ order, open, onOpenChange }: ReturnRequestDialogProps) {
  const { id: orderId } = useParams<{ id: string }>()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (data: ReturnRequestFormValues) => {
    if (!orderId) {
      console.error('Order ID is missing for return request.')
      return // Should not happen if dialog is opened from OrderDetail page
    }
    try {
      // Call the actual API
      const response = await createReturnRequest(orderId, data)
      console.log('Return Request API Response:', response)
      setIsSuccess(true)
    } catch (error) {
      console.error('Return request failed:', error)
      // Display error message to user, e.g., using toast
      throw error // Re-throw to let react-hook-form handle errors
    }
  }

  const handleClose = () => {
    setIsSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Request Return</DialogTitle>
              <DialogDescription>
                Select the items you wish to return and provide a reason.
              </DialogDescription>
            </DialogHeader>
            <ReturnRequestForm
              order={order}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
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
              <DialogTitle className="text-center">Return Requested Successfully</DialogTitle>
              <DialogDescription className="text-center">
                Your return request has been submitted. We've sent a confirmation email with
                shipping instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-md text-sm text-left mt-4">
              <p className="font-semibold mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Print the shipping label sent to your email.</li>
                <li>Pack the items securely in their original packaging.</li>
                <li>Drop off the package at any authorized carrier location.</li>
              </ol>
            </div>
            <Button onClick={handleClose} className="w-full mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
