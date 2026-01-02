import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface StarRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  onChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  size?: number // icon size in px
}

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = 20,
  className,
  ...props
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  const displayValue = hoverValue ?? value

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (readOnly) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        onChange?.(index + 1)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        onChange?.(Math.min(max, value + 1))
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        onChange?.(Math.max(1, value - 1))
        break
    }
  }

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Rating: ${value} out of ${max} stars` : 'Rate this product'}
      {...props}
    >
      {Array.from({ length: max }).map((_, i) => {
        const ratingValue = i + 1
        const isFilled = ratingValue <= displayValue

        return (
          <button
            key={i}
            type="button"
            className={cn(
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-0.5',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => !readOnly && onChange?.(ratingValue)}
            onMouseEnter={() => !readOnly && setHoverValue(ratingValue)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onKeyDown={e => handleKeyDown(e, i)}
            disabled={readOnly}
            role={readOnly ? 'presentation' : 'radio'}
            aria-checked={value === ratingValue}
            aria-label={`${ratingValue} star${ratingValue === 1 ? '' : 's'}`}
            tabIndex={readOnly ? -1 : value === ratingValue || (value === 0 && i === 0) ? 0 : -1}
          >
            <Star
              size={size}
              className={cn(
                'stroke-1',
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground'
                // Handle half stars if we supported them visually, for now full stars
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
