import { ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useCartStore, useCartCount } from '../stores/cartStore'
import { Badge } from '@/shared/components/ui/badge'

export function CartIndicator() {
  const { setIsOpen } = useCartStore()
  const count = useCartCount()

  return (
    <Button
      variant="ghost"
      className="relative gap-2"
      onClick={() => setIsOpen(true)}
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="secondary"
          className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-[10px] min-w-[1.25rem] bg-slate-700 text-white border-white border-2"
        >
          {count}
        </Badge>
      )}
      <span className="hidden sm:inline">Cart</span>
    </Button>
  )
}
