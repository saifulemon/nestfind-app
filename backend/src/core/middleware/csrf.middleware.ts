import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    private readonly allowedOrigins: string[];

    constructor() {
        const origins = process.env.ALLOW_ORIGINS || 'http://localhost:5173,http://localhost:3000';
        this.allowedOrigins = origins.split(',').map((o) => o.trim()).filter(Boolean);
    }

    use(req: Request, res: Response, next: NextFunction) {
        const method = req.method.toUpperCase();
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return next();
        }

        const origin = req.headers.origin;
        const referer = req.headers.referer;

        if (!origin && !referer) {
            return next();
        }

        if (origin && this.isAllowedOrigin(origin)) {
            return next();
        }

        if (referer) {
            try {
                const refererOrigin = new URL(referer).origin;
                if (this.isAllowedOrigin(refererOrigin)) {
                    return next();
                }
            } catch {}
        }

        throw new ForbiddenException('Cross-origin request blocked');
    }

    private isAllowedOrigin(origin: string): boolean {
        if (this.allowedOrigins.length === 0) return false;
        return this.allowedOrigins.some(
            (allowed) =>
                allowed === origin ||
                allowed === '*' ||
                (allowed.endsWith('*') &&
                    origin.startsWith(allowed.replace('*', ''))),
        );
    }
}
