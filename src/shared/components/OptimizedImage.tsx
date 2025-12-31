import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useInView } from 'react-intersection-observer'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode
  containerClassName?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
}

export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  loading = 'lazy',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  })

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-muted/20',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {inView && !error ? (
        <>
          {!isLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full animate-pulse" />}
          <img
            src={src}
            alt={alt}
            loading={loading}
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            {...props}
          />
        </>
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center">
          Failed to load image
        </div>
      ) : (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
    </div>
  )
}
