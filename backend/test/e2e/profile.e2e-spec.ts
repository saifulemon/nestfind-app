import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import { createTestUser, seedTestUsers, testUsers, TEST_PASSWORD } from '../fixtures/user.fixture';
import { generateAccessToken, authHeader } from '../fixtures/auth.fixture';
import { User } from '../../src/modules/users/entities/user.entity';

import { ProfileModule } from '../../src/modules/profile/profile.module';
import { AuthTestModule } from '../setup/auth-test.module';

describe('Profile E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    const context = await createTestApp([AuthTestModule, ProfileModule]);
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

  // ─── GET /profile ──────────────────────────────────────────────────
  describe('GET /api/profile', () => {
    it('should return 200 with authenticated user profile', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      const res = await request(app.getHttpServer())
        .get('/api/profile')
        .set(authHeader(token))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Success');
      expect(res.body.data).toHaveProperty('id', user.id);
      expect(res.body.data).toHaveProperty('name', user.name);
      expect(res.body.data).toHaveProperty('email', user.email);
      expect(res.body.data).toHaveProperty('phone');
      expect(res.body.data).toHaveProperty('role', user.role);
      expect(res.body.data).toHaveProperty('status', user.status);
      expect(res.body.data).toHaveProperty('emailVerifiedAt');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/profile')
        .set(authHeader('invalid-token'))
        .expect(401);
    });
  });

  // ─── PATCH /profile ────────────────────────────────────────────────
  describe('PATCH /api/profile', () => {
    it('should return 200 with updated user profile', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      const res = await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader(token))
        .send({ name: 'Updated Name', phone: '+15559876543' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Success');
      expect(res.body.data).toHaveProperty('id', user.id);
      expect(res.body.data).toHaveProperty('name', 'Updated Name');
      expect(res.body.data).toHaveProperty('phone', '+15559876543');
      expect(res.body.data).toHaveProperty('email', user.email);
      // Email and role should not change via profile update
      expect(res.body.data).toHaveProperty('role', user.role);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 200 updating name only', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      const res = await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader(token))
        .send({ name: 'New Name Only' })
        .expect(200);

      expect(res.body.data.name).toBe('New Name Only');
      expect(res.body.data.email).toBe(user.email);
    });

    it('should return 200 updating phone only', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      const res = await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader(token))
        .send({ phone: '+15551112222' })
        .expect(200);

      expect(res.body.data.phone).toBe('+15551112222');
      expect(res.body.data.name).toBe(user.name);
    });

    it('should return 400 when name is too short (< 2 chars)', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader(token))
        .send({ name: 'A' })
        .expect(400);
    });

    it('should return 400 when name is too long (> 100 chars)', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader(token))
        .send({ name: 'A'.repeat(101) })
        .expect(400);
    });

    it('should return 400 when phone exceeds max length (> 20 chars)', async () => {
      const user = await createTestUser(dataSource, testUsers.renter);
      const token = generateAccessToken(user);

      await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader(token))
        .send({ phone: '+1'.repeat(11) })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/api/profile')
        .send({ name: 'No Auth' })
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .patch('/api/profile')
        .set(authHeader('invalid-token'))
        .send({ name: 'Bad Token' })
        .expect(401);
    });
  });
});
