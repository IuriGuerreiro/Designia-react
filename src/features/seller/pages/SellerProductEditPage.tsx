import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ProductForm } from '../components/products/ProductForm'
import { getProduct } from '../api/productsApi'

export function SellerProductEditPage() {
  const { slug } = useParams<{ slug: string }>()

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug!),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container py-8 text-center text-red-500">
        Product not found or failed to load.
      </div>
    )
  }

  return (
    <div className="container py-8">
      <ProductForm initialData={product} isEdit />
    </div>
  )
}
