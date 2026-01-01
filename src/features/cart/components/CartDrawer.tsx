import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useCartStore, useCartSubtotal, useCartCount } from '../stores/cartStore'
import { CartItem } from './CartItem'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/ui/EmptyState'

export function CartDrawer() {
  const navigate = useNavigate()
  const { isOpen, setIsOpen, items, fetchCart } = useCartStore()
  const subtotal = useCartSubtotal()
  const itemCount = useCartCount()

  useEffect(() => {
    if (isOpen) {
      fetchCart()
    }
  }, [isOpen, fetchCart])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
          <SheetDescription className="hidden">Review your items</SheetDescription>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="divide-y">
                {items.map(item => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-6">
              <Separator />
              <div className="space-y-1.5">
                <div className="flex text-base justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
              <SheetFooter>
                <Button className="w-full h-12 text-lg" onClick={() => setIsOpen(false)} asChild>
                  <Link to="/checkout">Checkout</Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Looks like you haven't added anything yet."
              action={{
                label: 'Start Shopping',
                onClick: () => {
                  setIsOpen(false)
                  navigate('/products')
                },
              }}
              className="border-none bg-transparent"
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
