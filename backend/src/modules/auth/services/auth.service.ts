import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { UserService } from '../../users/user.service';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RoleEnum } from '../../../common/enums/role.enum';
import { UserStatusEnum } from '../../../common/enums/user-status.enum';
import type { IJwtPayload } from '../../../shared/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken) private readonly resetTokenRepo: Repository<PasswordResetToken>,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.createUser({
      name: dto.name, email: dto.email, password: hashedPassword,
      phone: dto.phone ?? null, role: RoleEnum.RENTER, status: UserStatusEnum.ACTIVE,
    });
    const tokens = await this.generateTokens(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const user = await this.userService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatusEnum.SUSPENDED) throw new ForbiddenException('Account suspended');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.generateTokens(user);
    const { password, ...userWithoutPassword } = user;
    return { ...tokens, user: userWithoutPassword };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const existing = await this.refreshTokenRepo.findOne({ where: { token }, relations: ['user'] });
    if (!existing || existing.revokedAt) throw new UnauthorizedException('Invalid refresh token');
    if (new Date() > existing.expiresAt) throw new UnauthorizedException('Token expired');
    const result = await this.refreshTokenRepo.update({ token, revokedAt: IsNull() }, { revokedAt: new Date() });
    if (result.affected === 0) throw new UnauthorizedException('Token already revoked');
    const tokens = await this.generateTokens(existing.user);
    return { ...tokens, user: { id: existing.user.id, name: existing.user.name, email: existing.user.email, role: existing.user.role, avatarUrl: existing.user.avatarUrl } };
  }

  async logout(refreshToken: string): Promise<void> {
    const result = await this.refreshTokenRepo.update(
      { token: refreshToken, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    if (result.affected === 0) {
      return;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      const token = this.resetTokenRepo.create({ userId: user.id, token: uuid(), expiresAt: new Date(Date.now() + 3600000) });
      await this.resetTokenRepo.save(token);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.resetTokenRepo.findOne({ where: { token } });
    if (!resetToken) throw new NotFoundException('Invalid reset token');
    if (resetToken.usedAt) throw new UnauthorizedException('Token already used');
    if (new Date() > resetToken.expiresAt) throw new BadRequestException('Token expired');
    const result = await this.resetTokenRepo.update({ token, usedAt: IsNull() }, { usedAt: new Date() });
    if (result.affected === 0) throw new UnauthorizedException('Token already used');
    const user = await this.userService.findByIdOrFail(resetToken.userId);
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user.id, { password: hashed } as any);
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userService.findByIdOrFail(userId);
    const { password, ...result } = user;
    return result as User;
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userService.findByIdOrFail(userId);
    const avatarUrl = `uploads/avatars/${file.filename}`;
    await this.userService.update(userId, { avatarUrl } as any);
    const updated = await this.userService.findByIdOrFail(userId);
    const { password, ...result } = updated;
    return result as User;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: IJwtPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const token = this.refreshTokenRepo.create({ userId: user.id, token: uuid(), expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
    await this.refreshTokenRepo.save(token);
    return { accessToken, refreshToken: token.token };
  }
}
