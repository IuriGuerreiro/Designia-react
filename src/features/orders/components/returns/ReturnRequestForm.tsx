import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload } from 'lucide-react'
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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { returnRequestSchema, returnReasons } from '../../types/return'
import type { ReturnRequestFormValues } from '../../types/return'
import type { OrderDetail } from '../../types'

interface ReturnRequestFormProps {
  order: OrderDetail
  onSubmit: (data: ReturnRequestFormValues) => Promise<void>
  onCancel: () => void
}

export function ReturnRequestForm({ order, onSubmit, onCancel }: ReturnRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const form = useForm<ReturnRequestFormValues>({
    resolver: zodResolver(returnRequestSchema),
    defaultValues: {
      items: [],
      reason: 'defective', // Default fallback
      comment: '',
      proof_images: [],
    },
  })

  // Handle item selection logic
  const handleItemToggle = (itemId: number, checked: boolean) => {
    const currentItems = form.getValues('items') || []
    let newItems = [...currentItems]

    if (checked) {
      // Add item with default quantity 1 (can be improved to allow partial quantity returns)
      newItems.push({ itemId, quantity: 1 })
      setSelectedItems([...selectedItems, itemId])
    } else {
      newItems = newItems.filter(i => i.itemId !== itemId)
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
    form.setValue('items', newItems, { shouldValidate: true })
  }

  const handleSubmit = async (data: ReturnRequestFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      toast.success('Return request submitted successfully')
      // Reset handled by parent or redirection happens
    } catch (error) {
      console.error('Return request failed:', error)
      toast.error('Failed to submit return request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Select items to return</h3>
          <div className="space-y-3 border rounded-md p-4 bg-muted/10">
            {order.items.map(item => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={checked => handleItemToggle(item.id, checked as boolean)}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className="flex-1 flex gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="h-10 w-10 bg-muted rounded overflow-hidden border">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="line-clamp-1">{item.product_name}</p>
                    <p className="text-muted-foreground font-normal mt-1">
                      Qty: {item.quantity} -{' '}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(parseFloat(item.unit_price))}
                    </p>
                  </div>
                </label>
              </div>
            ))}
            {form.formState.errors.items && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.items.message}
              </p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Return</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {returnReasons.map(reason => (
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
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide more details about the issue..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload Placeholder - Simulating file input */}
        <div className="space-y-2">
          <FormLabel>Proof Images (Optional)</FormLabel>
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 5MB)</p>
            <Input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={e => {
                // Handle file selection logic here if implementing real upload
                // For prototype we just log
                console.log(e.target.files)
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selectedItems.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </div>
      </form>
    </Form>
  )
}
