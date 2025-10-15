import type { AuthUser, RateLimitStatus, SellerApplicationStatus } from '../model';

export interface LoginSuccessResponse {
  access: string;
  refresh: string;
  user: AuthUser;
  requires_2fa?: false;
}

export interface LoginRequires2FAResponse {
  requires_2fa: true;
  user_id: number;
  message?: string;
  code_already_sent?: boolean;
}

export type LoginResponse = LoginSuccessResponse | LoginRequires2FAResponse;

export interface LoginVerify2FAResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface ResendTwoFactorCodeResponse {
  success: boolean;
  message: string;
}

export interface RegisterSuccessResponse {
  success: boolean;
  message: string;
  email?: string;
  errors?: Record<string, string | string[]>;
}

export interface SimpleMessageResponse {
  success: boolean;
  message: string;
}

export interface GoogleLoginResponse {
  success: boolean;
  tokens?: {
    access: string;
    refresh: string;
  };
  user?: AuthUser;
  is_new_user?: boolean;
  error?: string;
  detail?: string;
}

export interface SellerApplicationResponse extends SimpleMessageResponse {
  application_id?: number;
}

export interface SellerApplicationPayload {
  businessName: string;
  sellerType: string;
  motivation: string;
  portfolio: string;
  socialMedia?: string;
  workshopPhotos: File[];
}

export type EmailRateLimitResponse = RateLimitStatus;

export type SellerApplicationStatusResponse = SellerApplicationStatus;
