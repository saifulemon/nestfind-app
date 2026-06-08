import { httpService } from '~/services/httpService';
import type {
  LoginDto,
  RegisterDto,
  LoginResponse,
  RegisterResponse,
  AuthUser,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '~/types/api/auth';

export const authService = {
  login: (data: LoginDto) =>
    httpService.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterDto) =>
    httpService.post<RegisterResponse>('/auth/register', data),

  logout: () =>
    httpService.post<void>('/auth/logout'),

  refresh: () =>
    httpService.post<LoginResponse>('/auth/refresh'),

  getMe: () =>
    httpService.get<AuthUser>('/auth/me'),

  forgotPassword: (data: ForgotPasswordDto) =>
    httpService.post<void>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordDto) =>
    httpService.post<void>('/auth/reset-password', data),
};
