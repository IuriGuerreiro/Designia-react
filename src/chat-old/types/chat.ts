// Chat Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_temp_url?: string;
}

export interface Message {
  id: number;
  chat: number;
  sender: User;
  message_type: 'text' | 'image';
  text_content?: string;
  image_url?: string;
  image_temp_url?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

export interface Chat {
  id: number;
  user1: User;
  user2: User;
  other_user: User;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count: number;
}

export interface ChatListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Chat[];
}

export interface MessageListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Message[];
}

export interface SearchUsersResponse {
  users: User[];
}

export interface ImageUploadResponse {
  message: string;
  image_url: string;
  image_temp_url: string;
  size: number;
  content_type: string;
  uploaded_at: string;
}