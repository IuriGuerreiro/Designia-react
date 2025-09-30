import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_email_verified?: boolean;
  two_factor_enabled?: boolean;
  is_oauth_only_user?: boolean;
  is_verified_seller?: boolean;
  seller_type?: string;
  language?: string;
  role?: 'user' | 'seller' | 'admin';
  profile?: {
    // Basic Profile Information
    bio?: string;
    location?: string;
    birth_date?: string;
    gender?: string;
    pronouns?: string;
    
    // Contact Information
    phone_number?: string;
    country_code?: string;
    website?: string;
    
    // Professional Information
    job_title?: string;
    company?: string;
    
    // Address Information
    street_address?: string;
    city?: string;
    state_province?: string;
    country?: string;
    postal_code?: string;
    
    // Social Media Links
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    facebook_url?: string;
    
    // Preferences
    timezone?: string;
    language_preference?: string;
    currency_preference?: string;
    
    // Account Settings
    account_type?: string;
    profile_visibility?: string;
    
    // Verification & Status
    is_verified?: boolean;
    is_verified_seller?: boolean;
    seller_type?: string;
    
    // Metadata
    created_at?: string;
    updated_at?: string;
    profile_completion_percentage?: number;
    
    // Marketing Preferences
    marketing_emails_enabled?: boolean;
    newsletter_enabled?: boolean;
    notifications_enabled?: boolean;
  }
}

interface RateLimitStatus {
  can_send: boolean;
  time_remaining: number;
}

interface SellerApplicationRequest {
  businessName: string;
  sellerType: string;
  motivation: string;
  portfolio: string;
  socialMedia?: string;
  workshopPhotos: File[];
}

interface SellerApplicationStatus {
  has_application: boolean;
  is_seller: boolean;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
  application_id?: number;
  submitted_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{requires2FA?: boolean, userId?: number, message?: string, codeAlreadySent?: boolean, emailNotVerified?: boolean, email?: string, warningType?: string, actionRequired?: string}>;
  loginVerify2FA: (userId: number, code: string) => Promise<void>;
  resend2FACode: (userId: number, purpose?: string) => Promise<{success: boolean, message: string}>;
  register: (userData: RegisterData) => Promise<{success: boolean, message: string, email?: string}>;
  verifyEmail: (token: string) => Promise<{success: boolean, message: string}>;
  resendVerification: (email: string) => Promise<{success: boolean, message: string}>;
  checkEmailRateLimit: (email: string, requestType?: string) => Promise<RateLimitStatus>;
  googleLogin: (googleUserData: any) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  changeLanguage: (languageCode: string) => Promise<void>;
  logout: () => void;

  // Seller application methods
  submitSellerApplication: (applicationData: SellerApplicationRequest) => Promise<{success: boolean, message: string, application_id?: number}>;
  getSellerApplicationStatus: () => Promise<SellerApplicationStatus>;

  // User role helpers
  isSeller: () => boolean;
  isAdmin: () => boolean;
  canSellProducts: () => boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const userData = await apiRequest(API_ENDPOINTS.USER_PROFILE);
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<{requires2FA?: boolean, userId?: number, message?: string, emailNotVerified?: boolean, email?: string, warningType?: string, actionRequired?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      

      if (!response.ok) {
        // Handle server errors (5xx)
        if (response.status >= 500) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        console.log('Login response status:', response.status);
        console.log('Login response data:', errorData);
        
        // Handle 401 errors (authentication failures) - show user-friendly messages
        if (response.status === 401) {
          throw new Error(errorData.error || errorData.message || 'Invalid login credentials');
        }
        
        // Handle 403 errors (forbidden - like unverified email)
        if (response.status === 403) {
          // Check if it's an email verification issue
          if (errorData.email_verified === false) {
            console.log('Email verification required, returning warning data');
            return {
              emailNotVerified: true,
              email: errorData.user_email || email,
              message: errorData.error || errorData.message || 'Please verify your email address before logging in.',
              warningType: errorData.warning_type || 'email_verification_required',
              actionRequired: errorData.action_required || 'verify_email'
            };
          }
          throw new Error(errorData.error || errorData.message || 'Access denied');
        }
        
        // For other errors, show generic message
        throw new Error('Service may be unavailable. Please try again later.');
      }

      const data = await response.json();
      
      // Check if 2FA is required
      if (data.requires_2fa) {
        return {
          requires2FA: true,
          userId: data.user_id,
          message: data.message,
          codeAlreadySent: data.code_already_sent
        };
      }
      
      // Normal login - store tokens and set user
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Set user from response
      setUser(data.user);
      
      return {};
      
    } catch (error) {
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Service may be unavailable. Please try again later.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginVerify2FA = async (userId: number, code: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(API_ENDPOINTS.LOGIN_VERIFY_2FA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, code }),
      });
      

      if (!response.ok) {
        // Handle server errors (5xx)
        if (response.status >= 500) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error('Service may be unavailable. Please try again later.');
        }
        
        throw new Error(errorData.error || 'Invalid verification code');
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Set user from response
      setUser(data.user);
      
    } catch (error) {
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Service may be unavailable. Please try again later.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resend2FACode = async (userId: number, purpose: string = 'login'): Promise<{success: boolean, message: string}> => {
    try {
      const response = await fetch(API_ENDPOINTS.RESEND_2FA_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, purpose }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to resend verification code'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    }
  };

  const register = async (userData: RegisterData): Promise<{success: boolean, message: string, email?: string}> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle server errors (5xx)
        if (response.status >= 500) {
          return {
            success: false,
            message: 'Service may be unavailable. Please try again later.'
          };
        }
        
        // Handle 400 errors (validation errors) - show specific messages
        if (response.status === 400 && data.errors) {
          const errorMessages = [];
          if (data.errors.email) errorMessages.push(`Email: ${data.errors.email}`);
          if (data.errors.password) errorMessages.push(`Password: ${data.errors.password}`);
          if (data.errors.password_confirm) errorMessages.push(`Password confirmation: ${data.errors.password_confirm}`);
          if (data.errors.username) errorMessages.push(`Username: ${data.errors.username}`);
          if (data.errors.first_name) errorMessages.push(`First name: ${data.errors.first_name}`);
          if (data.errors.last_name) errorMessages.push(`Last name: ${data.errors.last_name}`);
          if (data.errors.general) errorMessages.push(data.errors.general);
          
          return {
            success: false,
            message: errorMessages.length > 0 ? errorMessages.join('. ') : (data.error || 'Registration failed')
          };
        }
        
        // For other client errors, show generic message
        return {
          success: false,
          message: 'Service may be unavailable. Please try again later.'
        };
      }

      return {
        success: true,
        message: data.message,
        email: data.email
      };
      
    } catch (error) {
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Service may be unavailable. Please try again later.'
        };
      }
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.error || 'Email verification failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    }
  };

  const resendVerification = async (email: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await fetch(API_ENDPOINTS.RESEND_VERIFICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to resend verification email'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    }
  };

  const checkEmailRateLimit = async (email: string, requestType: string = 'email_verification'): Promise<RateLimitStatus> => {
    try {
      const response = await fetch(API_ENDPOINTS.CHECK_EMAIL_RATE_LIMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, request_type: requestType }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          can_send: data.can_send,
          time_remaining: data.time_remaining
        };
      } else {
        // On error, assume rate limiting is not active
        return {
          can_send: true,
          time_remaining: 0
        };
      }
    } catch (error) {
      // On network error, assume rate limiting is not active
      return {
        can_send: true,
        time_remaining: 0
      };
    }
  };

  const googleLogin = async (googleUserData: any): Promise<void> => {
    try {
      setIsLoading(true);
      
      console.log('=== GOOGLE LOGIN START ===');
      console.log('Google user data:', googleUserData);
      
      // Unified login/register approach - single endpoint handles both scenarios
      const enrichedData = {
        ...googleUserData,
        platform: 'web',
        timestamp: new Date().toISOString(),
      };
      
      console.log('Sending to endpoint:', API_ENDPOINTS.GOOGLE_LOGIN);
      console.log('Payload:', enrichedData);
      
      const response = await fetch(API_ENDPOINTS.GOOGLE_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const { tokens, user: userData, is_new_user } = data;
          
          
          // Store tokens
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          
          setUser(userData);
          return;
        } else {
          throw new Error(data.error || 'Google authentication failed');
        }
      } else {
        console.error('Server error response status:', response.status);
        
        try {
          const errorData = await response.json();
          console.error('Server error data:', errorData);
          
          if (response.status === 500) {
            throw new Error('Server error during Google authentication. Please try again or contact support.');
          }
          
          throw new Error(errorData.error || errorData.detail || 'Google authentication failed');
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          
          if (response.status === 500) {
            throw new Error('Server error during Google authentication. Please try again later.');
          }
          
          throw new Error(`Authentication failed with status ${response.status}`);
        }
      }
      
    } catch (error) {
      
      // Check if it's a network error or server exception
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Service may be unavailable. Please try again later.');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
        const response = await apiRequest(API_ENDPOINTS.USER_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
        setUser(response);
    } catch (error: any) {
        throw new Error(error.message || 'Profile update failed.');
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await apiRequest(API_ENDPOINTS.USER_PROFILE);
      setUser(userData);
    } catch (error) {
      // Don't logout on refresh failure, just log the error
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.CHANGE_LANGUAGE, {
        method: 'POST',
        body: JSON.stringify({ language: languageCode }),
      });

      // Update the user state with the new language
      if (user) {
        setUser({ ...user, language: languageCode });
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change language.');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  // Seller application methods
  const submitSellerApplication = async (applicationData: SellerApplicationRequest): Promise<{success: boolean, message: string, application_id?: number}> => {
    try {
      const formData = new FormData();

      // Add basic application data
      formData.append('businessName', applicationData.businessName);
      formData.append('sellerType', applicationData.sellerType);
      formData.append('motivation', applicationData.motivation);
      formData.append('portfolio', applicationData.portfolio);

      if (applicationData.socialMedia) {
        formData.append('socialMedia', applicationData.socialMedia);
      }

      // Add workshop photos
      applicationData.workshopPhotos.forEach((file) => {
        formData.append('workshopPhotos', file);
      });

      const response = await apiRequest(API_ENDPOINTS.SELLER_APPLICATION_APPLY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh user data to get updated status
        await refreshUserData();

        return {
          success: true,
          message: data.message || 'Seller application submitted successfully!',
          application_id: data.application_id
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to submit seller application'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.'
      };
    }
  };

  const getSellerApplicationStatus = async (): Promise<SellerApplicationStatus> => {
    try {
      const response = await apiRequest(API_ENDPOINTS.SELLER_APPLICATION_STATUS);
      return response;
    } catch (error) {
      return {
        has_application: false,
        is_seller: user?.role === 'seller' || false,
        status: undefined
      };
    }
  };

  // User role helpers
  const isSeller = (): boolean => {
    return user?.role === 'seller' || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || false;
  };

  const canSellProducts = (): boolean => {
    return isSeller() || isAdmin();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginVerify2FA,
    resend2FACode,
    register,
    verifyEmail,
    resendVerification,
    checkEmailRateLimit,
    googleLogin,
    updateProfile,
    refreshUserData,
    changeLanguage,
    logout,

    // Seller application methods
    submitSellerApplication,
    getSellerApplicationStatus,

    // User role helpers
    isSeller,
    isAdmin,
    canSellProducts,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
