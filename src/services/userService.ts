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

export interface SellerApplicationImage {
  id: number;
  image: string;
  image_type: string;
  description: string;
  order: number;
  uploaded_at: string;
}

export interface SellerApplication {
  id: number;
  business_name: string;
  seller_type: string;
  motivation: string;
  portfolio_url: string;
  social_media_url?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
  admin_notes?: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  approved_by?: number;
  rejected_by?: number;
  approved_by_name?: string;
  rejected_by_name?: string;
  user_email: string;
  user_name: string;
  images: SellerApplicationImage[];
}

export interface UserRole {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'seller' | 'admin';
  is_seller: boolean;
  is_admin: boolean;
  can_sell_products: boolean;
}

export interface SellerApplicationRequest {
  businessName: string;
  sellerType: string;
  motivation: string;
  portfolio: string;
  socialMedia?: string;
  workshopPhotos: File[];
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
