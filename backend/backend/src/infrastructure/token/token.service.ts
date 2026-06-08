import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  generateRefreshToken(payload: { sub: string }): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    return this.jwtService.verify(token);
  }
}
