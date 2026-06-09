import { RoleEnum } from '~/enums/role.enum';

export function getHomeRouteForRole(role: RoleEnum | string | undefined): string {
  switch (role) {
    case RoleEnum.ADMIN:
      return '/admin/dashboard';
    case RoleEnum.RENTER:
      return '/search';
    default:
      return '/';
  }
}
