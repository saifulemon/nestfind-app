import type { RoleEnum } from '~/enums/role.enum';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: RoleEnum;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authChecked: boolean;
  error: string | null;
}

export interface LoginResponse {
  message?: string;
  error?: string;
  data?: {
    email: string;
    password: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
