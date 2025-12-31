import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useCartStore } from '../stores/cartStore'
import type { CartStateItem as CartItemType } from '../types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-4 py-4">
      <OptimizedImage
        src={item.image}
        alt={item.name}
        aspectRatio="square"
        containerClassName="h-20 w-20 flex-shrink-0 rounded-md border bg-white"
        className="object-contain"
      />

      <div className="flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-foreground">
            <h3 className="line-clamp-2 pr-4">{item.name}</h3>
            <p className="ml-4 flex-shrink-0">
              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ${parseFloat(item.price).toFixed(2)} each
          </p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-4 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
