import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { Slider } from '@/shared/components/ui/slider'
import { Star, X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import { getCategories } from '../../api/productsApi'
import type { GetProductsParams } from '../../types'

interface FilterSidebarProps {
  filters: GetProductsParams
  onFiltersChange: (filters: GetProductsParams) => void
  onClearFilters: () => void
}

export function FilterSidebar({ filters, onFiltersChange, onClearFilters }: FilterSidebarProps) {
  // Local state for price range (updates immediately, commits on change end)
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.price_min || 0,
    filters.price_max || 10000,
  ])

  // Local state for optimistic updates
  const [localCategory, setLocalCategory] = useState<string | undefined>(filters.category)
  const [localCondition, setLocalCondition] = useState<string | undefined>(filters.condition)

  // Fetch categories from API
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  // Sync local state with filter changes from URL
  useEffect(() => {
    if (filters.price_min !== localPriceRange[0] || filters.price_max !== localPriceRange[1]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPriceRange([filters.price_min || 0, filters.price_max || 10000])
    }
  }, [filters.price_min, filters.price_max]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (filters.category !== localCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalCategory(filters.category)
    }
  }, [filters.category]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (filters.condition !== localCondition) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalCondition(filters.condition)
    }
  }, [filters.condition]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePriceChange = (value: number[]) => {
    const [min, max] = value
    // Ensure min doesn't exceed max
    if (min <= max) {
      setLocalPriceRange([min, max])
    }
  }

  const handlePriceCommit = () => {
    const [min, max] = localPriceRange
    // Only update if values are different and valid
    if (min <= max && (min !== filters.price_min || max !== filters.price_max)) {
      onFiltersChange({
        ...filters,
        price_min: min === 0 ? undefined : min,
        price_max: max === 10000 ? undefined : max,
      })
    }
  }

  const handleCategoryChange = (categorySlug: string) => {
    const newVal = localCategory === categorySlug ? undefined : categorySlug
    setLocalCategory(newVal)
    onFiltersChange({
      ...filters,
      category: newVal,
    })
  }

  const handleConditionChange = (condition: string) => {
    // Cast strict condition type
    const newVal =
      localCondition === condition ? undefined : (condition as GetProductsParams['condition'])
    setLocalCondition(newVal)
    onFiltersChange({
      ...filters,
      condition: newVal,
    })
  }

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      min_rating: filters.min_rating === rating ? undefined : rating,
    })
  }

  const handleInStockChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      in_stock: checked ? true : undefined,
    })
  }

  const hasActiveFilters =
    (filters.price_min !== undefined && filters.price_min > 0) ||
    (filters.price_max !== undefined && filters.price_max < 10000) ||
    filters.category !== undefined ||
    filters.condition !== undefined ||
    filters.min_rating !== undefined ||
    filters.in_stock !== undefined

  return (
    <div className="space-y-4">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={['price', 'category', 'condition', 'rating', 'stock']}
        className="w-full"
      >
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2 px-2">
              <Slider
                min={0}
                max={10000}
                step={50}
                value={localPriceRange}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceCommit}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>${localPriceRange[0].toLocaleString()}</span>
                <span>${localPriceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        <AccordionItem value="category">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 py-2">
              {isLoadingCategories ? (
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories available</p>
              ) : (
                categories.map(category => (
                  <div key={category.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.slug}`}
                      checked={localCategory === category.slug}
                      onCheckedChange={() => handleCategoryChange(category.slug)}
                    />
                    <Label
                      htmlFor={`category-${category.slug}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Condition */}
        <AccordionItem value="condition">
          <AccordionTrigger>Condition</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 py-2">
              {[
                { value: 'new', label: 'New' },
                { value: 'like_new', label: 'Like New' },
                { value: 'good', label: 'Good' },
                { value: 'fair', label: 'Fair' },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${value}`}
                    checked={localCondition === value}
                    onCheckedChange={() => handleConditionChange(value)}
                  />
                  <Label
                    htmlFor={`condition-${value}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating">
          <AccordionTrigger>Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 py-2">
              {[4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 transition-colors ${
                    filters.min_rating === rating
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? filters.min_rating === rating
                              ? 'fill-white text-white'
                              : 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">& Up</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stock Availability */}
        <AccordionItem value="stock">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="py-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.in_stock || false}
                  onCheckedChange={handleInStockChange}
                />
                <Label htmlFor="in-stock" className="cursor-pointer text-sm font-normal">
                  In Stock Only
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
