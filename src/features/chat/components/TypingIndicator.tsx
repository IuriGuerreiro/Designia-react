import React from 'react'

interface TypingIndicatorProps {
  username?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 italic text-xs text-muted-foreground animate-pulse">
      <div className="flex gap-1">
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></span>
      </div>
      <span>{username ? `${username} is typing...` : 'Someone is typing...'}</span>
    </div>
  )
}
