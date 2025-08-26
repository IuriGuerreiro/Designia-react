import { apiRequest, API_ENDPOINTS } from '../config/api';

export interface SellerProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  job_title?: string;
  company?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  is_verified_seller?: boolean;
  seller_type?: string;
  created_at?: string;
}

class UserService {
  /**
   * Get user profile by ID
   */
  async getSellerProfile(sellerId: number): Promise<SellerProfile> {
    try {
      const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE(sellerId));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Get public user profile by ID
   */
  async getPublicProfile(userId: number): Promise<any> {
    try {
      const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE(userId));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching public profile:', error);
      throw new Error('Failed to fetch public profile');
    }
  }

  /**
   * Search users by username or name
   */
  async searchUsers(query: string): Promise<any[]> {
    try {
      const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE(query));
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get verified sellers list
   */
  async getVerifiedSellers(page: number = 1, pageSize: number = 20): Promise<{
    results: SellerProfile[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const response = await apiRequest(API_ENDPOINTS.SELLER_PROFILE(page, pageSize));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching verified sellers:', error);
      throw new Error('Failed to fetch verified sellers');
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
