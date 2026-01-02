import { Badge } from '@/shared/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export function VerifiedBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1.5 text-[10px] h-5 px-2 font-medium text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
    >
      <CheckCircle2 size={10} />
      Verified Purchase
    </Badge>
  )
}
