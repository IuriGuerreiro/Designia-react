import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { fulfillOrder } from '../../api/ordersApi'
import type { OrderDetail } from '@/features/orders/types'

const fulfillmentSchema = z.object({
  shipping_carrier: z.string().min(2, 'Carrier name is required'),
  tracking_number: z.string().min(5, 'Valid tracking number is required'),
  carrier_code: z.string().optional(),
})

type FulfillmentFormValues = z.infer<typeof fulfillmentSchema>

interface FulfillmentDialogProps {
  order: OrderDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function FulfillmentDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: FulfillmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FulfillmentFormValues>({
    resolver: zodResolver(fulfillmentSchema),
    defaultValues: {
      shipping_carrier: '',
      tracking_number: '',
      carrier_code: '',
    },
  })

  const onSubmit = async (values: FulfillmentFormValues) => {
    if (!order) return

    try {
      setIsSubmitting(true)
      await fulfillOrder(order.id, values)
      toast.success('Order marked as shipped!')
      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error: unknown) {
      console.error('Fulfillment error:', error)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any
      toast.error(err.response?.data?.detail || 'Failed to update shipping information')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" /> Fulfill Order
          </DialogTitle>
          <DialogDescription>
            Enter shipping details for Order #{order?.id.slice(0, 8)}. The buyer will be notified.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="shipping_carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Carrier</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. FedEx, UPS, DHL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tracking_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tracking ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carrier_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. fedex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark as Shipped
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
