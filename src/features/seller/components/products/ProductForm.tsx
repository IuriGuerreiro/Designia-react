import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Card, CardContent } from '@/shared/components/ui/card'

import { createProduct, updateProduct } from '../../api/productsApi'
import { ImageUpload } from './ImageUpload'
import type { Product } from '../../types'
import apiClient from '@/shared/api/axios' // For category fetching

interface ProductImage {
  id?: number
  image?: string
  image_content?: string
  preview?: string
  filename?: string
  is_primary: boolean
  order?: number
}

interface Category {
  id: number
  name: string
}

// Zod Schema
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  stock_quantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'), // Assuming ID as string
  condition: z.enum(['new', 'used', 'refurbished']),
  brand: z.string().optional(),
  tags: z.string().optional(), // Comma separated string
  images: z.array(z.custom<ProductImage>()).min(1, 'At least one image is required'),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Product
  isEdit?: boolean
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories (Simple implementation)
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/marketplace/categories/')
      // Assuming response structure, flatten if needed
      return res.data.results || res.data
    },
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData ? parseFloat(initialData.price) : 0,
      stock_quantity: initialData?.stock_quantity || 0,
      category: initialData?.category?.toString() || '',
      condition: initialData?.condition || 'new',
      brand: initialData?.brand || '',
      tags: initialData?.tags?.join(', ') || '',
      images: initialData?.images || [],
    },
  })

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      // Transform form values to API payload
      const payload: Record<string, unknown> = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
        // Handle images: split into 'images' (existing) and 'image_data' (new uploads) if backend requires
        // Or send all as image_data if simple, but 'ProductCreateUpdateSerializer' says:
        // images = read_only, image_data = write_only.
        // So for update, we can't delete images via 'images' field easily unless we use a separate endpoint or specific logic.
        // For Create: map all to image_data.
        // For Update: It's tricky. Usually we add new ones via image_data.
        // Deleting old ones might need specific API call or sending IDs to keep?
        // Serializer says `images` is read_only. So standard update doesn't delete images.
        // For MVP, we'll just handle ADDING images via base64. Deletion logic might need separate implementation or is ignored for now.
      }

      // Filter out existing images from image_data
      const newImages = values.images.filter((img: ProductImage) => img.image_content)
      if (newImages.length > 0) {
        payload.image_data = newImages.map((img: ProductImage) => ({
          image_content: img.image_content,
          filename: img.filename || 'upload.png',
          is_primary: img.is_primary,
          order: 0,
        }))
      }

      // Remove 'images' from payload as it's read-only
      delete payload.images

      if (isEdit && initialData) {
        return updateProduct(initialData.slug, payload)
      } else {
        return createProduct(payload)
      }
    },
    onSuccess: () => {
      toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
      navigate('/seller/products')
    },
    onError: (error: Error) => {
      console.error(error)
      toast.error('Failed to save product. ' + (error instanceof Error ? error.message : ''))
    },
  })

  const onSubmit = (values: ProductFormValues) => {
    setIsSubmitting(true)
    mutation.mutate(values, {
      onSettled: () => setIsSubmitting(false),
    })
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/seller/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <ImageUpload images={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vintage Leather Jacket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat: Category) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          )) || (
                            <div className="p-2 text-sm text-muted-foreground">
                              Loading categories...
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nike" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="summer, fashion, sale" {...field} />
                    </FormControl>
                    <FormDescription>Help users find your product with keywords.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/seller/products')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Product
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
