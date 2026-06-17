import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable()
export class SetTokenInterceptor implements NestInterceptor {
    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const res = context.switchToHttp().getResponse();
        const req = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((value) => {
                if (value.success) {
                    const cookieName = this.configService.get<string>(
                        'authTokenCookieName',
                    ) || 'access_token';
                    const tokenValue = value.token as string;
                    const cookieDomain = this.configService.get<string>(
                        'cookieDomain',
                    ) || '';

                    res.cookie(cookieName, tokenValue, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        domain: cookieDomain || undefined,
                        path: '/',
                    });

                    if (value?.refreshToken) {
                        res.cookie('refresh_token', value.refreshToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'strict',
                            domain: cookieDomain || undefined,
                            path: '/',
                        });
                    }

                    return {
                        success: true,
                        message: value.message,
                        ...(value.result && { result: value.result }),
                    };
                } else {
                    return value;
                }
            }),
            catchError((err) => {
                if (err instanceof HttpException) {
                    return throwError(() => err);
                }
                return throwError(() => new InternalServerErrorException(err.message || 'An unexpected error occurred'));
            }),
        );
    }
}
