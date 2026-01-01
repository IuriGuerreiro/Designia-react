import React, { useState, useRef } from 'react'
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

interface ChatInputProps {
  onSendMessage: (text: string) => void
  onSendImage?: (file: File) => void
  onTyping?: () => void
  disabled?: boolean
  isSending?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendImage,
  onTyping,
  disabled,
  isSending,
}) => {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastTypingTimeRef = useRef<number>(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    // Emit typing event every 2 seconds while typing
    const now = Date.now()
    if (onTyping && now - lastTypingTimeRef.current > 2000) {
      onTyping()
      lastTypingTimeRef.current = now
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled && !isSending) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onSendImage) {
      onSendImage(file)
    }
  }

  return (
    <div className="p-4 border-t bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        <Input
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-muted/50 border-none h-10"
          disabled={disabled || isSending}
        />

        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={!message.trim() || disabled || isSending}
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  )
}
