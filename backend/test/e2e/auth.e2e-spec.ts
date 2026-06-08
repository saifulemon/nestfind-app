import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import {
  createTestUser,
  seedTestUsers,
  testUsers,
  TEST_PASSWORD,
} from '../fixtures/user.fixture';
import {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  authHeader,
} from '../fixtures/auth.fixture';
import { User } from '../../src/modules/users/entities/user.entity';
import { PasswordResetToken } from '../../src/modules/auth/entities/password-reset-token.entity';
import { RoleEnum } from '../../src/common/enums/role.enum';
import { v4 as uuid } from 'uuid';

import { AuthModule } from '../../src/modules/auth/auth.module';

describe('Auth E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    const context = await createTestApp([AuthModule]);
    app = context.app;
    module = context.module;
    dataSource = getDataSource(module);
  });

  afterAll(async () => {
    await closeTestApp({ app, module });
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
  });

  // ─── POST /auth/register ───────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    const validBody = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'SecurePass123!',
      phone: '+15551234567',
    };

    it('should return 201 with user data on successful registration', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validBody)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.result).toHaveProperty('id');
      expect(res.body.result).toHaveProperty('name', 'Jane Doe');
      expect(res.body.result).toHaveProperty('email', 'jane@example.com');
      expect(res.body.result).toHaveProperty('role', RoleEnum.RENTER);
      expect(res.body.result).toHaveProperty('status', 'active');
      expect(res.body.result).toHaveProperty('createdAt');
      expect(res.body.result).toHaveProperty('updatedAt');
      expect(res.body.result).not.toHaveProperty('password');
    });

    it('should return 201 without optional phone field', async () => {
      const { phone, ...bodyWithoutPhone } = validBody;
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(bodyWithoutPhone)
        .expect(201);

      expect(res.body.result.phone).toBeNull();
    });

    it('should return 400 when name is missing', async () => {
      const { name, ...body } = validBody;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(body)
        .expect(400);
    });

    it('should return 400 when name is too short (< 2 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validBody, name: 'A' })
        .expect(400);
    });

    it('should return 400 when name is too long (> 100 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validBody, name: 'A'.repeat(101) })
        .expect(400);
    });

    it('should return 400 when email is missing', async () => {
      const { email, ...body } = validBody;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(body)
        .expect(400);
    });

    it('should return 400 when email is invalid format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validBody, email: 'not-an-email' })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      const { password, ...body } = validBody;
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(body)
        .expect(400);
    });

    it('should return 400 when password is too short (< 8 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validBody, password: 'Short1!' })
        .expect(400);
    });

    it('should return 400 when phone exceeds max length (> 20 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validBody, phone: '+1'.repeat(11) })
        .expect(400);
    });

    it('should return 409 when email is already registered', async () => {
      await createTestUser(dataSource, testUsers.renter);
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validBody, email: testUsers.renter.email })
        .expect(409);
    });
  });

  // ─── POST /auth/login ──────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await createTestUser(dataSource, testUsers.renter);
    });

    const validCredentials = {
      email: testUsers.renter.email,
      password: TEST_PASSWORD,
    };

    it('should return 200 with user data on successful login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(validCredentials)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.result).toHaveProperty('id');
      expect(res.body.result).toHaveProperty('name');
      expect(res.body.result).toHaveProperty('email');
      expect(res.body.result).toHaveProperty('role');
      expect(res.body.result).not.toHaveProperty('password');
    });

    it('should set access_token httpOnly cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(validCredentials)
        .expect(200);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('access_token');
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: TEST_PASSWORD })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUsers.renter.email })
        .expect(400);
    });

    it('should return 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 401 with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: TEST_PASSWORD })
        .expect(401);
    });

    it('should return 401 with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUsers.renter.email, password: 'WrongPass1!' })
        .expect(401);
    });

    it('should return 403 when account is suspended', async () => {
      const suspended = await createTestUser(dataSource, testUsers.suspendedRenter);
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: suspended.email, password: TEST_PASSWORD })
        .expect(403);
    });
  });

  // ─── POST /auth/logout ─────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should return 200 and clear cookie on successful logout', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set(authHeader(token))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set(authHeader('invalid-token'))
        .expect(401);
    });
  });

  // ─── POST /auth/refresh ────────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    it('should return 200 with new tokens on successful refresh', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const refreshToken = await generateRefreshToken(dataSource, user);

      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Token refreshed successfully');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.result).toHaveProperty('id', user.id);
      expect(res.body.result).toHaveProperty('name');
      expect(res.body.result).toHaveProperty('email');
      expect(res.body.result).toHaveProperty('role');
      expect(res.body.result).not.toHaveProperty('password');
    });

    it('should return 401 when no refresh token provided', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(401);
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });

    it('should return 401 with revoked refresh token', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const refreshToken = await generateRefreshToken(dataSource, user);

      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  // ─── POST /api/auth/forgot-password ────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 even for unknown email (prevents enumeration)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'unknown@test.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('If an account with that email exists');
    });

    it('should return 200 for existing user email', async () => {
      await createTestUser(dataSource, testUsers.renter);

      const res = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: testUsers.renter.email })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);
    });

    it('should return 400 when email is invalid format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  // ─── POST /api/auth/reset-password ─────────────────────────────────────
  describe('POST /api/auth/reset-password', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await createTestUser(dataSource, testUsers.renter);
    });

    it('should return 200 on successful password reset', async () => {
      const resetToken = await generatePasswordResetToken(dataSource, testUser);

      const res = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: resetToken, password: 'NewSecurePass456!' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password reset successfully');
    });

    it('should return 400 when token is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ password: 'NewSecurePass456!' })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'some-token' })
        .expect(400);
    });

    it('should return 400 when password is too short (< 8 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'some-token', password: 'Short1!' })
        .expect(400);
    });

    it('should return 404 when token is invalid/not found', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-reset-token', password: 'NewSecurePass456!' })
        .expect(404);
    });

    it('should return 400 when token is expired', async () => {
      const repo = dataSource.getRepository(PasswordResetToken);
      const tokenEntity = repo.create({
        userId: testUser.id,
        token: uuid(),
        expiresAt: new Date(Date.now() - 3600000),
      });
      await repo.save(tokenEntity);

      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: tokenEntity.token, password: 'NewSecurePass456!' })
        .expect(400);
    });
  });

  // ─── GET /auth/me ─────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return 200 with current user profile', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set(authHeader(token))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User retrieved successfully');
      expect(res.body.data).toHaveProperty('id', user.id);
      expect(res.body.data).toHaveProperty('name', user.name);
      expect(res.body.data).toHaveProperty('email', user.email);
      expect(res.body.data).toHaveProperty('role', user.role);
      expect(res.body.data).toHaveProperty('status', user.status);
      expect(res.body.data).toHaveProperty('emailVerifiedAt');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set(authHeader('invalid-token'))
        .expect(401);
    });

    it('should return correct role for admin user', async () => {
      const admin = await createTestUser(dataSource, testUsers.admin);
      const token = generateAccessToken(admin);

      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set(authHeader(token))
        .expect(200);

      expect(res.body.data.role).toBe(RoleEnum.ADMIN);
    });
  });
});
