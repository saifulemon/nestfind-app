import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../config/static-data.config';
import { PASSPORT_AUTH_TOKEN } from '../../config/static-data.config';

@Injectable()
export class JwtAuthGuard extends AuthGuard(PASSPORT_AUTH_TOKEN) {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            // Run passport auth but allow anonymous access on failure
            const result = super.canActivate(context);
            if (typeof result === 'boolean') return result;
            return (result as Promise<boolean>).catch(() => true);
        }
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Sorry! User Not Found');
        }
        return user;
    }
}
