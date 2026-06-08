import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(RefreshToken) public readonly refreshToken: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken) public readonly passwordReset: Repository<PasswordResetToken>,
  ) {}
}
