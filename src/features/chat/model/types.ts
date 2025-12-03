export type ChatMessageType = 'text' | 'image';

export interface ChatUser {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ChatMessage {
  id: number | string;
  chat: string | number;
  sender: ChatUser;
  message_type: ChatMessageType;
  text_content?: string;
  image_url?: string;
  image_temp_url?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  error?: string;
  isTemp?: boolean;
}

export interface ChatSummary {
  id: string | number;
  other_user: ChatUser;
  last_message?: ChatMessage;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface ChatWebSocketMessage {
  type: 'connection_success' | 'new_message' | 'new_chat' | 'message_read' | 'user_typing' | 'error' | 'pong';
  message?: string;
  user_id?: string | number;
  chat_data?: ChatSummary;
  message_data?: ChatMessage;
  chat_id?: string | number;
}

export interface ChatContextValue {
  isConnected: boolean;
  connectionError: string | null;
  chats: ChatSummary[];
  currentChat: ChatSummary | null;
  messages: Record<number | string, ChatMessage[]>;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (chatId: string | number, content: string, messageType?: ChatMessageType) => Promise<void>;
  loadChats: () => Promise<void>;
  selectChat: (chat: ChatSummary) => Promise<void>;
  createChat: (userId: string | number) => Promise<ChatSummary>;
  loadMessages: (chatId: string | number, page?: number) => Promise<void>;
  markMessagesAsRead: (chatId: string | number) => Promise<void>;
  markChatAsViewed: (chatId: string | number) => Promise<void>;
  searchUsers: (query: string) => Promise<ChatUser[]>;
  getUnreadCount: (chatId: string | number) => number;
  getTotalUnreadCount: () => number;
  setCurrentChat: (chat: ChatSummary | null) => void;
  clearMessages: (chatId: string | number) => void;
}
