import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type Chat, type Message, type User, type ChatListResponse, type MessageListResponse, type SearchUsersResponse, type ImageUploadResponse } from '../types/chat';

class ChatService {
  // Get list of chats
  async getChats(): Promise<Chat[]> {
    try {
      return await apiRequest(API_ENDPOINTS.CHAT);
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  // Get chat details
  async getChat(chatId: number): Promise<Chat> {
    try {
      return await apiRequest(API_ENDPOINTS.CHAT_DETAIL(chatId));
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw error;
    }
  }

  // Create new chat with user
  async createChat(userId: number): Promise<Chat> {
    try {
      return await apiRequest(API_ENDPOINTS.CHAT_CREATE, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Get messages for a chat
  async getMessages(chatId: number, page: number = 1): Promise<MessageListResponse> {
    try {
      return await apiRequest(`${API_ENDPOINTS.CHAT_MESSAGES(chatId)}?page=${page}`);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send text message
  async sendTextMessage(chatId: number, text: string): Promise<Message> {
    try {
      return await apiRequest(API_ENDPOINTS.CHAT_SEND_MESSAGE(chatId), {
        method: 'POST',
        body: JSON.stringify({
          message_type: 'text',
          text_content: text,
        }),
      });
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  // Send image message
  async sendImageMessage(chatId: number, imageUrl: string): Promise<Message> {
    try {
      return await apiRequest(API_ENDPOINTS.CHAT_SEND_MESSAGE(chatId), {
        method: 'POST',
        body: JSON.stringify({
          message_type: 'image',
          image_url: imageUrl,
        }),
      });
    } catch (error) {
      console.error('Error sending image message:', error);
      throw error;
    }
  }

  // Upload image for chat
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      return await apiRequest(API_ENDPOINTS.CHAT_UPLOAD_IMAGE, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: number): Promise<void> {
    try {
      await apiRequest(API_ENDPOINTS.CHAT_MARK_READ(chatId), {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.CHAT_SEARCH_USERS}?q=${encodeURIComponent(query)}`);
      return response.users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Upload and send image in one operation
  async uploadAndSendImage(chatId: number, file: File): Promise<Message> {
    try {
      // First upload the image
      const uploadResult = await this.uploadImage(file);
      
      // Then send the image message
      return await this.sendImageMessage(chatId, uploadResult.image_url);
    } catch (error) {
      console.error('Error uploading and sending image:', error);
      throw error;
    }
  }
}

export default new ChatService();