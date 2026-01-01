import type { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/shared/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  headingLevel?: 'h2' | 'h3' | 'h4'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  headingLevel: Heading = 'h3',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 border-dashed bg-muted/10',
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <Heading className="text-lg font-medium tracking-tight mb-2">{title}</Heading>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
