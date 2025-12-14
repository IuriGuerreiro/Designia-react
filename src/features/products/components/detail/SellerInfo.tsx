import type { ProductDetailSeller } from '@/features/products/types'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Star, ShieldCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface SellerInfoProps {
  seller: ProductDetailSeller
}

export function SellerInfo({ seller }: SellerInfoProps) {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">
              {seller.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900">{seller.username}</h4>
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="Verified Seller" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="flex items-center text-amber-500 gap-0.5">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-semibold text-slate-900">{seller.seller_rating}</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
          Visit Store
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
