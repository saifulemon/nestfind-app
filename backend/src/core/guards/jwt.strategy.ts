import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PASSPORT_AUTH_TOKEN } from "../../config/static-data.config";
import type { IJwtPayload } from "../../shared/interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, PASSPORT_AUTH_TOKEN) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('AUTH_JWT_SECRET');
    if (!secret) {
      throw new Error('AUTH_JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies[
              configService.get<string>('AUTH_TOKEN_COOKIE_NAME') ||
              'access_token'
            ];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: IJwtPayload) {
    if (!payload.id) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
