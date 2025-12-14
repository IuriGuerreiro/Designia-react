import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import type { ProductDetailImage } from '@/features/products/types'

interface ImageGalleryProps {
  images: ProductDetailImage[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ProductDetailImage | null>(
    images.find(img => img.is_primary) || images[0] || null
  )

  if (!selectedImage) return <div className="bg-muted aspect-square rounded-lg" />

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-lg border bg-white aspect-square group">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt_text || productName}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map(image => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className={cn(
                'relative flex-none w-20 h-20 rounded-md border bg-white overflow-hidden ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedImage.id === image.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
              )}
            >
              <img
                src={image.url}
                alt={image.alt_text || productName}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
