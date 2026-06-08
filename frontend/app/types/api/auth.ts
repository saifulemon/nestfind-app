export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'renter' | 'admin';
  status: 'active' | 'suspended';
}

export interface LoginResponse {
  user: AuthUser;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'renter';
  status: 'active';
  createdAt: string;
  updatedAt: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}
