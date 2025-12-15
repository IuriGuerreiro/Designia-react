import { useInfiniteQuery } from '@tanstack/react-query'
import { getProducts } from '../api/productsApi'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import type { GetProductsParams } from '../types'

interface ProductListProps {
  params?: GetProductsParams
  title?: string
  description?: string
}

export function ProductList({ params = {}, title, description }: ProductListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ['products', params],
      queryFn: ({ pageParam = 1 }) => getProducts({ ...params, page: pageParam, page_size: 12 }),
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = (params.page || 1) + allPages.length - 1
        return lastPage.has_next ? currentPage + 1 : undefined
      },
      initialPageParam: 1,
    })

  // Using react-intersection-observer for infinite scroll
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const products = data?.pages.flatMap(page => page.results) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        {description && <p className="text-muted-foreground">{description}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-destructive">
        Error loading products: {error?.message || 'Unknown error'}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No products found matching your criteria.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-3xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button
            ref={ref} // Attach ref for intersection observer
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
