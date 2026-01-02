import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface ReviewUserMetaProps {
  username: string
  avatarUrl?: string
  createdAt: string
}

export function ReviewUserMeta({ username, avatarUrl, createdAt }: ReviewUserMetaProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-none text-foreground">{username}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
