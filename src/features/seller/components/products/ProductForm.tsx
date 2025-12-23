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
import { ARModelUpload } from './ARModelUpload'
import type { Product } from '../../types'
import apiClient from '@/shared/api/axios' // For category fetching

interface ProductImage {
  id?: number
  image?: string
  url?: string
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
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  brand: z.string().optional(),
  tags: z.string().optional(), // Comma separated string
  images: z.array(z.custom<ProductImage>()).min(1, 'At least one image is required'),
  ar_model: z
    .object({
      filename: z.string().optional(),
      content: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
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
      const res = await apiClient.get('/marketplace/products/categories/')
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
      category: initialData?.category?.id?.toString() || '',
      condition: initialData?.condition || 'new',
      brand: initialData?.brand || '',
      tags: initialData?.tags?.join(', ') || '',
      images: initialData?.images || [],
      ar_model: initialData?.has_ar_model
        ? {
            filename: initialData.ar_model_filename,
            url: initialData.ar_model_url,
          }
        : undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      // Transform form values to API payload
      const payload: Record<string, unknown> = {
        ...values,
        category: parseInt(values.category),
        price: values.price.toString(),
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
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

      // Handle AR Model
      const hasOriginalModel = initialData?.has_ar_model
      const currentModel = values.ar_model
      // Check if model is effectively cleared (undefined, null, or empty object/filename)
      const isModelCleared = !currentModel || (!currentModel.filename && !currentModel.content)

      if (isModelCleared && hasOriginalModel) {
        // User removed the existing model
        payload.model_data = null
      } else if (currentModel && currentModel.content) {
        // User uploaded a new model
        payload.model_data = {
          model_content: currentModel.content,
          filename: currentModel.filename || 'model.glb',
        }
      }
      delete payload.ar_model

      if (isEdit && initialData) {
        return updateProduct(initialData.slug, payload)
      } else {
        return createProduct(payload)
      }
    },
    onSuccess: () => {
      toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
      // If editing, invalidate the specific product query to refresh the form data immediately
      if (isEdit && initialData) {
        queryClient.invalidateQueries({ queryKey: ['product', initialData.slug] })
      }
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

              <FormField
                control={form.control}
                name="ar_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AR Model (3D)</FormLabel>
                    <FormControl>
                      <ARModelUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      Upload a .glb or .gltf file for Augmented Reality features.
                    </FormDescription>
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
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
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
