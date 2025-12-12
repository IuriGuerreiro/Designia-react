import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-sm">
      <CardHeader className="relative h-48 p-0">
        <Skeleton className="w-full h-full rounded-b-none" />
      </CardHeader>
      <CardContent className="p-4 pb-2 flex-grow space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3 mt-2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}
