import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable()
export class RemoveTokenInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((value) => {
        if (value?.success) {
          const sameSite = this.configService.get<string>('cookieSameSite') || 'strict';

          res.cookie(
            this.configService.get<string>("authTokenCookieName") || 'access_token',
            "",
            {
              httpOnly: true,
              path: "/",
              sameSite: sameSite as 'strict' | 'lax' | 'none',
              secure: process.env.NODE_ENV === "production",
            },
          );
          res.cookie(
            'refresh_token',
            "",
            {
              httpOnly: true,
              path: "/",
              sameSite: sameSite as 'strict' | 'lax' | 'none',
              secure: process.env.NODE_ENV === "production",
            },
          );

          return {
            success: true,
            statusCode: value.statusCode || 200,
            message: value.message || "Logged out successfully",
            data: value.data ?? null,
            timestamp: new Date().toISOString(),
            path: req.url || '/api/auth/logout',
          };
        }

        return value;
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
