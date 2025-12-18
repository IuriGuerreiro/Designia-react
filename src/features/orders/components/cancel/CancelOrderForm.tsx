import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { Button } from '@/shared/components/ui/button'
import { cancelRequestSchema, cancelReasons } from '../../types/cancel'
import type { CancelRequestFormValues } from '../../types/cancel'

interface CancelOrderFormProps {
  onSubmit: (data: CancelRequestFormValues) => Promise<void>
  onCancel: () => void
}

export function CancelOrderForm({ onSubmit, onCancel }: CancelOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CancelRequestFormValues>({
    resolver: zodResolver(cancelRequestSchema),
    defaultValues: {
      reason: 'changed_mind',
      comment: '',
    },
  })

  const handleSubmit = async (data: CancelRequestFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      toast.success('Order cancellation submitted successfully')
    } catch (error) {
      console.error('Cancellation request failed:', error)
      toast.error('Failed to cancel order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Cancellation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cancelReasons.map(reason => (
                    <SelectItem key={reason} value={reason} className="capitalize">
                      {reason.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any extra details..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Keep Order
          </Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Form>
  )
}
