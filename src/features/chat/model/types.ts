export type ChatMessageType = 'text' | 'image';

export interface ChatUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ChatMessage {
  id: number | string;
  chat: number;
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
  id: number;
  other_user: ChatUser;
  last_message?: ChatMessage;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface ChatWebSocketMessage {
  type: 'connection_success' | 'new_message' | 'new_chat' | 'message_read' | 'user_typing' | 'error' | 'pong';
  message?: string;
  user_id?: number;
  chat_data?: ChatSummary;
  message_data?: ChatMessage;
  chat_id?: number;
}

export interface ChatContextValue {
  isConnected: boolean;
  connectionError: string | null;
  chats: ChatSummary[];
  currentChat: ChatSummary | null;
  messages: Record<number, ChatMessage[]>;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (chatId: number, content: string, messageType?: ChatMessageType) => Promise<void>;
  loadChats: () => Promise<void>;
  selectChat: (chat: ChatSummary) => Promise<void>;
  createChat: (userId: number) => Promise<ChatSummary>;
  loadMessages: (chatId: number, page?: number) => Promise<void>;
  markMessagesAsRead: (chatId: number) => Promise<void>;
  markChatAsViewed: (chatId: number) => Promise<void>;
  searchUsers: (query: string) => Promise<ChatUser[]>;
  getUnreadCount: (chatId: number) => number;
  getTotalUnreadCount: () => number;
  setCurrentChat: (chat: ChatSummary | null) => void;
  clearMessages: (chatId: number) => void;
}
