import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/shared/components/ui/form'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { updateProfile } from '../api/accountApi'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import type { ProfileData } from '../types'

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Please enter a valid email address'), // Disabled in UI
  phone_number: z.string().optional().or(z.literal('')), // Empty string allowed for optional field
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const { user, refreshUserProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '', // Email is displayed but not editable
      phone_number: user?.profile?.phone_number || '',
    },
  })

  // Update form values when user data changes (e.g. after refreshUserProfile)
  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
      })
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true)

    try {
      const payload: ProfileData = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number || null, // API expects null for optional empty strings
      }

      const response = await updateProfile(payload)

      // Refresh user data in store to reflect changes from backend
      await refreshUserProfile()

      toast.success(response.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                Email cannot be changed. Contact support if you need to update it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 123-4567" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Used for order notifications and account recovery.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  )
}
