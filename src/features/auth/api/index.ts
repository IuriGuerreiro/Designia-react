import { apiRequest, HttpError } from '@/shared/api';
import type { RegisterData, AuthUser } from '../model';
import type {
  EmailRateLimitResponse,
  GoogleLoginResponse,
  LoginResponse,
  LoginVerify2FAResponse,
  ResendTwoFactorCodeResponse,
  SellerApplicationPayload,
  SellerApplicationResponse,
  SellerApplicationStatusResponse,
  SimpleMessageResponse,
} from './types';

export const login = (email: string, password: string) =>
  apiRequest<LoginResponse>('LOGIN', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const verifyTwoFactorLogin = (userId: number, code: string) =>
  apiRequest<LoginVerify2FAResponse>('LOGIN_VERIFY_2FA', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, code }),
  });

export const resendTwoFactorCode = (userId: number, purpose: string = 'login') =>
  apiRequest<ResendTwoFactorCodeResponse>('RESEND_2FA_CODE', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, purpose }),
  });

export const register = (payload: RegisterData) =>
  apiRequest<SimpleMessageResponse>('REGISTER', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const verifyEmail = (token: string) =>
  apiRequest<SimpleMessageResponse>('VERIFY_EMAIL', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

export const resendVerificationEmail = (email: string) =>
  apiRequest<SimpleMessageResponse>('RESEND_VERIFICATION', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const checkEmailRateLimit = (email: string, requestType: string = 'email_verification') =>
  apiRequest<EmailRateLimitResponse>('CHECK_EMAIL_RATE_LIMIT', {
    method: 'POST',
    body: JSON.stringify({ email, request_type: requestType }),
  });

export const googleLogin = (payload: Record<string, unknown>) =>
  apiRequest<GoogleLoginResponse>('GOOGLE_LOGIN', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchProfile = () => apiRequest<AuthUser>('USER_PROFILE');

export const updateProfile = (profile: Partial<AuthUser>) =>
  apiRequest<AuthUser>('USER_PROFILE', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });

export const changeLanguage = (languageCode: string) =>
  apiRequest<SimpleMessageResponse>('CHANGE_LANGUAGE', {
    method: 'POST',
    body: JSON.stringify({ language: languageCode }),
  });

export const requestPasswordSetup = () =>
  apiRequest<SimpleMessageResponse>('PASSWORD_SETUP_REQUEST', {
    method: 'POST',
    body: JSON.stringify({}),
  });

export const completePasswordSetup = (code: string, password: string, passwordConfirm: string) =>
  apiRequest<SimpleMessageResponse>('PASSWORD_SETUP_SET', {
    method: 'POST',
    body: JSON.stringify({
      code,
      password,
      password_confirm: passwordConfirm,
    }),
  });

export const fetchTwoFactorStatus = () =>
  apiRequest<{ two_factor_enabled: boolean; email: string }>('TWO_FACTOR_STATUS');

export const toggleTwoFactor = (enable: boolean) =>
  apiRequest<{ requires_verification?: boolean } & SimpleMessageResponse>('TWO_FACTOR_TOGGLE', {
    method: 'POST',
    body: JSON.stringify({ enable }),
  });

export const verifyTwoFactorAction = (code: string, purpose?: string) =>
  apiRequest<SimpleMessageResponse>('TWO_FACTOR_VERIFY', {
    method: 'POST',
    body: JSON.stringify(
      purpose ? { code, purpose } : { code },
    ),
  });

export const requestPasswordReset = (email: string) =>
  apiRequest<SimpleMessageResponse>('PASSWORD_RESET_REQUEST', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const completePasswordReset = (token: string, password: string, passwordConfirm: string) =>
  apiRequest<SimpleMessageResponse>('PASSWORD_RESET', {
    method: 'POST',
    body: JSON.stringify({
      token,
      password,
      password_confirm: passwordConfirm,
    }),
  });

export const submitSellerApplication = (payload: SellerApplicationPayload) => {
  const formData = new FormData();
  formData.append('businessName', payload.businessName);
  formData.append('sellerType', payload.sellerType);
  formData.append('motivation', payload.motivation);
  formData.append('portfolio', payload.portfolio);

  if (payload.socialMedia) {
    formData.append('socialMedia', payload.socialMedia);
  }

  payload.workshopPhotos.forEach((file) => {
    formData.append('workshopPhotos', file);
  });

  return apiRequest<SellerApplicationResponse>('SELLER_APPLICATION_APPLY', {
    method: 'POST',
    body: formData,
  });
};

export const fetchSellerApplicationStatus = () =>
  apiRequest<SellerApplicationStatusResponse>('SELLER_APPLICATION_STATUS');

export const ensureHttpError = (error: unknown) => {
  if (error instanceof HttpError) {
    return error;
  }
  return undefined;
};

export type {
  LoginResponse,
  LoginSuccessResponse,
  LoginRequires2FAResponse,
} from './types';
