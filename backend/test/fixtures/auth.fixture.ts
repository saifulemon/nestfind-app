import jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from '../../src/modules/users/entities/user.entity';
import { RefreshToken } from '../../src/modules/auth/entities/refresh-token.entity';
import { PasswordResetToken } from '../../src/modules/auth/entities/password-reset-token.entity';

const TEST_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'test-jwt-secret-for-e2e-tests';

/**
 * Generates a real signed JWT access token for testing.
 */
export function generateAccessToken(user: User): string {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Creates a real RefreshToken entity in the database.
 */
export async function generateRefreshToken(
  dataSource: DataSource,
  user: User,
): Promise<string> {
  const repo = dataSource.getRepository(RefreshToken);
  const token = repo.create({
    userId: user.id,
    token: uuid(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await repo.save(token);
  return token.token;
}

/**
 * Creates a real PasswordResetToken entity in the database.
 */
export async function generatePasswordResetToken(
  dataSource: DataSource,
  user: User,
): Promise<string> {
  const repo = dataSource.getRepository(PasswordResetToken);
  const token = repo.create({
    userId: user.id,
    token: uuid(),
    expiresAt: new Date(Date.now() + 3600000),
  });
  await repo.save(token);
  return token.token;
}

/**
 * Returns the auth header object for supertest requests.
 * Sets the JWT as an httpOnly cookie per the project's auth pattern.
 */
export function authHeader(token: string): Record<string, string> {
  return { Cookie: `access_token=${token}` };
}

export function refreshCookieHeader(token: string): Record<string, string> {
  return { Cookie: `refresh_token=${token}` };
}

export function authAndRefreshCookieHeader(
  accessToken: string,
  refreshToken: string,
): Record<string, string> {
  return {
    Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
  };
}
