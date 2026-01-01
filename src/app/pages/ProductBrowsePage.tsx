import { useSearchParams } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Filter, SortAsc } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { FilterSidebar } from '@/features/products/components/filters/FilterSidebar'
import { NoResults } from '@/features/products/components/filters/NoResults'
import { ProductCard } from '@/features/products/components/ProductCard'
import { ProductCardSkeleton } from '@/features/products/components/ProductCardSkeleton'
import { searchProducts } from '@/features/products/api/productsApi'
import type { SearchProductsParams } from '@/features/products/types'
import { Loader2 } from 'lucide-react'
import { useInView } from 'react-intersection-observer'

export function ProductBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Parse filters from URL

  const filters: SearchProductsParams = useMemo(() => {
    const categoryParams = searchParams.getAll('category')

    const conditionParams = searchParams.getAll('condition')

    return {
      q: searchParams.get('q') || undefined,

      category: categoryParams.length > 0 ? categoryParams : undefined,

      price_min: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,

      price_max: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,

      condition: conditionParams.length > 0 ? conditionParams : undefined,

      min_rating: searchParams.get('min_rating')
        ? Number(searchParams.get('min_rating'))
        : undefined,

      in_stock: searchParams.get('in_stock') === 'true' || undefined,

      ordering: (searchParams.get('ordering') as string) || '-created_at', // Default to newest
    }
  }, [searchParams])

  // Update URL when filters change

  const updateFilters = useCallback(
    (newFilters: SearchProductsParams) => {
      const params = new URLSearchParams()

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)))
          } else {
            params.set(key, String(value))
          }
        }
      })

      setSearchParams(params, { replace: true })
    },
    [setSearchParams]
  )

  const handleFiltersChange = useCallback(
    (newFilters: SearchProductsParams) => {
      updateFilters({ ...newFilters, page: 1 })
    },
    [updateFilters]
  )

  const handleClearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const handleSortChange = useCallback(
    (sort: string) => {
      updateFilters({ ...filters, ordering: sort })
    },
    [filters, updateFilters]
  )

  // Fetch products with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ['search-products', filters],
      queryFn: ({ pageParam = 1 }) =>
        searchProducts({ ...filters, page: pageParam, page_size: 12 }),
      getNextPageParam: lastPage => {
        return lastPage.has_next ? lastPage.page + 1 : undefined
      },
      initialPageParam: 1,
    })

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const products = data?.pages.flatMap(page => page.results) || []
  const totalCount = data?.pages[0]?.count || 0

  const hasActiveFilters =
    filters.price_min !== undefined ||
    filters.price_max !== undefined ||
    filters.category !== undefined ||
    filters.condition !== undefined ||
    filters.min_rating !== undefined ||
    filters.in_stock !== undefined

  return (
    <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Browse Products</h1>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-4">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {isLoading ? (
                <span>Loading products...</span>
              ) : (
                <span>
                  {totalCount} {totalCount === 1 ? 'product' : 'products'} found
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <Select value={filters.ordering || '-created_at'} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="-created_at">Newest First</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="-price">Price: High to Low</SelectItem>
                  <SelectItem value="-average_rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your product search</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={newFilters => {
                        handleFiltersChange(newFilters)
                        setMobileFiltersOpen(false)
                      }}
                      onClearFilters={() => {
                        handleClearFilters()
                        setMobileFiltersOpen(false)
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center text-destructive py-10">
              Error loading products: {error?.message || 'Unknown error'}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !isError && products.length === 0 && (
            <NoResults
              searchQuery={filters.q}
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}

          {/* Products Grid */}
          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    ref={ref}
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
            </>
          )}
        </main>
      </div>
    </div>
  )
}
