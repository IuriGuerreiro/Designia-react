import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  login as loginRequest,
  verifyTwoFactorLogin,
  resendTwoFactorCode,
  register as registerRequest,
  verifyEmail as verifyEmailRequest,
  resendVerificationEmail,
  checkEmailRateLimit as checkEmailRateLimitRequest,
  googleLogin as googleLoginRequest,
  fetchProfile,
  updateProfile as updateProfileRequest,
  changeLanguage as changeLanguageRequest,
  submitSellerApplication as submitSellerApplicationRequest,
  fetchSellerApplicationStatus,
  ensureHttpError,
} from '../api';
import type {
  AuthUser,
  RateLimitStatus,
  RegisterData,
  SellerApplicationRequest,
  SellerApplicationStatus,
} from '../model';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{requires2FA?: boolean, userId?: number, message?: string, codeAlreadySent?: boolean, emailNotVerified?: boolean, email?: string, warningType?: string, actionRequired?: string}>;
  loginVerify2FA: (userId: number, code: string) => Promise<void>;
  resend2FACode: (userId: number, purpose?: string) => Promise<{success: boolean, message: string}>;
  register: (userData: RegisterData) => Promise<{success: boolean, message: string, email?: string}>;
  verifyEmail: (token: string) => Promise<{success: boolean, message: string}>;
  resendVerification: (email: string) => Promise<{success: boolean, message: string}>;
  checkEmailRateLimit: (email: string, requestType?: string) => Promise<RateLimitStatus>;
  googleLogin: (googleUserData: any) => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const userData = await fetchProfile();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
      setIsBootstrapping(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<{requires2FA?: boolean, userId?: number, message?: string, codeAlreadySent?: boolean, emailNotVerified?: boolean, email?: string, warningType?: string, actionRequired?: string}> => {
    try {
      setIsLoading(true);

      const response = await loginRequest(email, password);

      console.log('Login response:', response);

      if ('requires_2fa' in response && response.requires_2fa) {
        return {
          requires2FA: true,
          userId: response.user_id,
          message: response.message,
          codeAlreadySent: response.code_already_sent,
        };
      }

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      setUser(response.user);

      return {};
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        const getString = (value: unknown, fallback?: string) =>
          typeof value === 'string' ? value : fallback;

        if (httpError.status >= 500) {
          throw new Error('Service may be unavailable. Please try again later.');
        }

        if (httpError.status === 401) {
          const message = getString(errorData.error, getString(errorData.message, 'Invalid login credentials'));
          throw new Error(message ?? 'Invalid login credentials');
        }

        if (httpError.status === 403) {
          const emailVerified =
            'email_verified' in errorData ? (errorData.email_verified as boolean | undefined) : undefined;

          if (emailVerified === false) {
            return {
              emailNotVerified: true,
              email: getString(errorData.user_email, email),
              message:
                getString(
                  errorData.error,
                  getString(errorData.message, 'Please verify your email address before logging in.'),
                ),
              warningType: getString(errorData.warning_type, 'email_verification_required'),
              actionRequired: getString(errorData.action_required, 'verify_email'),
            };
          }

          const message = getString(errorData.error, getString(errorData.message, 'Access denied'));
          throw new Error(message ?? 'Access denied');
        }

        const message = getString(errorData.error, getString(errorData.message, httpError.message));
        throw new Error(message ?? 'Service may be unavailable. Please try again later.');
      }

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

      const data = await verifyTwoFactorLogin(userId, code);

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setUser(data.user);
      // Redirect to home after successful 2FA verification
      navigate('/');
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        const message =
          typeof errorData.error === 'string'
            ? errorData.error
            : typeof errorData.message === 'string'
              ? errorData.message
              : httpError.status >= 500
                ? 'Service may be unavailable. Please try again later.'
                : httpError.message;
        throw new Error(message);
      }

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
      const response = await resendTwoFactorCode(userId, purpose);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        return {
          success: false,
          message:
            typeof errorData.error === 'string'
              ? errorData.error
              : typeof errorData.message === 'string'
                ? errorData.message
                : 'Failed to resend verification code',
        };
      }

      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.',
      };
    }
  };

  const register = async (userData: RegisterData): Promise<{success: boolean, message: string, email?: string}> => {
    try {
      setIsLoading(true);

      const response = await registerRequest(userData);
      const success = typeof (response as any).success === 'boolean' ? (response as any).success : true;
      return {
        success,
        message: (response as any).message,
        email: (response as any).email,
      };
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        if (httpError.status >= 500) {
          return {
            success: false,
            message: 'Service may be unavailable. Please try again later.',
          };
        }

        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        const errors =
          'errors' in errorData && typeof errorData.errors === 'object' && errorData.errors !== null
            ? (errorData.errors as Record<string, unknown>)
            : undefined;

        if (httpError.status === 400 && errors) {
          const errorMessages: string[] = [];
          const appendError = (field: string, label?: string) => {
            const value = errors[field];
            if (typeof value === 'string') {
              errorMessages.push(label ? `${label}: ${value}` : value);
            } else if (Array.isArray(value)) {
              errorMessages.push(
                label ? `${label}: ${value.join(', ')}` : value.join(', '),
              );
            }
          };

          appendError('email', 'Email');
          appendError('password', 'Password');
          appendError('password_confirm', 'Password confirmation');
          appendError('username', 'Username');
          appendError('first_name', 'First name');
          appendError('last_name', 'Last name');
          appendError('general');

          return {
            success: false,
            message:
              errorMessages.length > 0
                ? errorMessages.join('. ')
                : (typeof errorData.error === 'string' ? errorData.error : 'Registration failed'),
          };
        }

        return {
          success: false,
          message:
            typeof errorData.error === 'string'
              ? errorData.error
              : typeof errorData.message === 'string'
                ? errorData.message
                : 'Service may be unavailable. Please try again later.',
        };
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Service may be unavailable. Please try again later.',
        };
      }
      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await verifyEmailRequest(token);
      const success = typeof (response as any).success === 'boolean' ? (response as any).success : true;
      return {
        success,
        message: (response as any).message,
      };
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        return {
          success: false,
          message:
            typeof errorData.error === 'string'
              ? errorData.error
              : typeof errorData.message === 'string'
                ? errorData.message
                : 'Email verification failed',
        };
      }

      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.',
      };
    }
  };

  const resendVerification = async (email: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await resendVerificationEmail(email);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        return {
          success: false,
          message:
            typeof errorData.error === 'string'
              ? errorData.error
              : typeof errorData.message === 'string'
                ? errorData.message
                : 'Failed to resend verification email',
        };
      }

      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.',
      };
    }
  };

  const checkEmailRateLimit = async (email: string, requestType: string = 'email_verification'): Promise<RateLimitStatus> => {
    try {
      return await checkEmailRateLimitRequest(email, requestType);
    } catch (error) {
      return {
        can_send: true,
        time_remaining: 0,
      };
    }
  };

  const googleLogin = async (googleUserData: any): Promise<void> => {
    try {
      setIsLoading(true);

      const enrichedData = {
        ...googleUserData,
        platform: 'web',
        timestamp: new Date().toISOString(),
      };

      const data = await googleLoginRequest(enrichedData);

      if (!data.success || !data.tokens || !data.user) {
        throw new Error(
          data.error || data.detail || 'Google authentication failed',
        );
      }

      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setUser(data.user);
      navigate('/')
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        const message =
          typeof errorData.error === 'string'
            ? errorData.error
            : typeof errorData.detail === 'string'
              ? errorData.detail
              : typeof errorData.message === 'string'
                ? errorData.message
                : httpError.status >= 500
                  ? 'Server error during Google authentication. Please try again later.'
                  : httpError.message;
        throw new Error(message);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Service may be unavailable. Please try again later.');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    try {
      const response = await updateProfileRequest(userData);
      setUser(response);
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        throw new Error(httpError.message || 'Profile update failed.');
      }
      if (error instanceof Error) {
        throw new Error(error.message || 'Profile update failed.');
      }
      throw new Error('Profile update failed.');
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await fetchProfile();
      setUser(userData);
    } catch (error) {
      // Silently ignore refresh errors
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      const response = await changeLanguageRequest(languageCode);

      if (user) {
        setUser({ ...user, language: languageCode });
      }

      return response;
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        throw new Error(httpError.message || 'Failed to change language.');
      }
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to change language.');
      }
      throw new Error('Failed to change language.');
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
      const response = await submitSellerApplicationRequest(applicationData);

      await refreshUserData();

      return {
        success: response.success,
        message: response.message || 'Seller application submitted successfully!',
        application_id: response.application_id,
      };
    } catch (error) {
      const httpError = ensureHttpError(error);
      if (httpError) {
        const errorData = (httpError.data ?? {}) as Record<string, unknown>;
        return {
          success: false,
          message:
            typeof errorData.error === 'string'
              ? errorData.error
              : typeof errorData.message === 'string'
                ? errorData.message
                : 'Failed to submit seller application',
        };
      }

      return {
        success: false,
        message: 'Service may be unavailable. Please try again later.',
      };
    }
  };

  const getSellerApplicationStatus = async (): Promise<SellerApplicationStatus> => {
    try {
      return await fetchSellerApplicationStatus();
    } catch (error) {
      return {
        has_application: false,
        is_seller: user?.role === 'seller' || false,
        status: undefined,
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
    isBootstrapping,
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
