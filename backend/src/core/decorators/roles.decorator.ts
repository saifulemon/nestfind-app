import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../config/static-data.config';

export const SetRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
