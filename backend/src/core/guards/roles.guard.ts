import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../config/static-data.config';
import { IS_PUBLIC_KEY } from '../../config/static-data.config';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) return true;

        const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!roles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const hasRole = roles.some((allowedRole) => {
            const userRole = user?.role;
            if (userRole == null) return false;
            return String(allowedRole) === String(userRole);
        });

        if (hasRole) return true;
        throw new ForbiddenException('This role does not have permission for this action.');
    }
}
