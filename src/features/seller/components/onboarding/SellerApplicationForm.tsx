import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
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
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { submitApplication } from '../../api/applicationApi'
import { toast } from 'sonner'

// Schema
const applicationSchema = z.object({
  business_name: z.string().min(3, 'Business name must be at least 3 characters'),
  motivation: z.string().min(20, 'Please provide a detailed description'),
  seller_type: z.enum(['individual', 'business']),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  // Simple file validation for now
  shop_logo: z.any().optional(),
  uploaded_images: z.any().optional(),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface SellerApplicationFormProps {
  onSuccess: () => void
}

export function SellerApplicationForm({ onSuccess }: SellerApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      business_name: '',
      motivation: '',
      seller_type: 'individual',
      portfolio_url: '',
    },
  })

  const onSubmit = async (values: ApplicationFormValues) => {
    setIsSubmitting(true)
    setServerError(null)
    try {
      // Transform values for API (File handling)
      // We need to get the actual File objects from the input refs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formData: any = { ...values }

      // Handle file inputs manually since RHF is tricky with FileList
      const logoInput = document.getElementById('shop_logo') as HTMLInputElement
      if (logoInput?.files?.length) {
        formData.shop_logo = logoInput.files[0]
      }

      const photosInput = document.getElementById('uploaded_images') as HTMLInputElement
      if (photosInput?.files?.length) {
        formData.uploaded_images = Array.from(photosInput.files)
      }

      await submitApplication(formData)
      toast.success('Application submitted successfully!')
      onSuccess()
    } catch (error: unknown) {
      console.error('Application error:', error)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any
      const errorMsg =
        err.response?.data?.detail || err.response?.data?.message || 'Failed to submit application'
      setServerError(errorMsg)

      // Specific handling for 2FA error
      if (
        typeof errorMsg === 'string' &&
        (errorMsg.includes('2FA') || errorMsg.includes('Two-factor'))
      ) {
        // Parent component might handle this, or we show a specific alert
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop / Business Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Store" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seller_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual / Sole Proprietor</SelectItem>
                  <SelectItem value="business">Registered Business</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motivation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description & Motivation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about what you sell and your experience..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolio_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio / Website URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Simple File Inputs (Uncontrolled, so using standard Label/Input) */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="shop_logo">Shop Logo</Label>
          <Input id="shop_logo" type="file" accept="image/*" />
          <p className="text-[0.8rem] text-muted-foreground">
            Recommended: Square image, at least 400x400px.
          </p>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="uploaded_images">Workshop Photos</Label>
          <Input id="uploaded_images" type="file" accept="image/*" multiple max={5} />
          <p className="text-[0.8rem] text-muted-foreground">
            Upload 1-5 photos of your workspace or products (max 5MB each).
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </form>
    </Form>
  )
}
