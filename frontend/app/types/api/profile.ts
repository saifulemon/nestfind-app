export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'renter' | 'admin';
  status: 'active' | 'suspended';
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
}
