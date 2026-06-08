import { httpService } from '~/services/httpService';
import type { AuthUser } from '~/types/api/auth';
import type { UpdateProfileDto } from '~/types/api/profile';

export const profileService = {
  get: () =>
    httpService.get<AuthUser>('/auth/me'),

  update: (data: UpdateProfileDto) =>
    httpService.patch<AuthUser>('/auth/me', data),
};
