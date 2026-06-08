import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import { createTestUser, seedTestUsers, testUsers } from '../fixtures/user.fixture';
import { generateAccessToken, authHeader } from '../fixtures/auth.fixture';
import { seedTestProperties } from '../fixtures/property.fixture';
import { User } from '../../src/modules/users/entities/user.entity';

import { AdminModule } from '../../src/modules/admin/admin.module';
import { AuthTestModule } from '../setup/auth-test.module';

describe('Admin Dashboard E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;

  beforeAll(async () => {
    const context = await createTestApp([AuthTestModule, AdminModule]);
    app = context.app;
    module = context.module;
    dataSource = getDataSource(module);
  });

  afterAll(async () => {
    await closeTestApp({ app, module });
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    const seeded = await seedTestUsers(dataSource);
    adminToken = generateAccessToken(seeded.admin);
    renterToken = generateAccessToken(seeded.renter);
  });

  // ─── GET /admin/dashboard ──────────────────────────────────────────
  describe('GET /api/admin/dashboard', () => {
    beforeEach(async () => {
      await seedTestProperties(dataSource);
    });

    it('should return 200 with dashboard statistics (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Dashboard statistics retrieved');
      expect(res.body.data).toHaveProperty('totalProperties');
      expect(res.body.data).toHaveProperty('totalInquiries');
      expect(res.body.data).toHaveProperty('newInquiries');
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('recentInquiries');
      expect(res.body.data).toHaveProperty('recentProperties');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', '/api/admin/dashboard');
    });

    it('should return non-negative integer values for aggregate counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(adminToken))
        .expect(200);

      expect(typeof res.body.data.totalProperties).toBe('number');
      expect(res.body.data.totalProperties).toBeGreaterThanOrEqual(0);
      expect(typeof res.body.data.totalInquiries).toBe('number');
      expect(res.body.data.totalInquiries).toBeGreaterThanOrEqual(0);
      expect(typeof res.body.data.newInquiries).toBe('number');
      expect(res.body.data.newInquiries).toBeGreaterThanOrEqual(0);
      expect(typeof res.body.data.totalUsers).toBe('number');
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(0);
    });

    it('should return count matching seeded properties', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(adminToken))
        .expect(200);

      // 3 properties seeded via seedTestProperties
      expect(res.body.data.totalProperties).toBe(3);
    });

    it('should return recent properties as an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(adminToken))
        .expect(200);

      expect(Array.isArray(res.body.data.recentProperties)).toBe(true);
      if (res.body.data.recentProperties.length > 0) {
        const item = res.body.data.recentProperties[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('propertyType');
        expect(item).toHaveProperty('createdAt');
      }
    });

    it('should return recent inquiries as an array (empty if none)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(adminToken))
        .expect(200);

      expect(Array.isArray(res.body.data.recentInquiries)).toBe(true);
      if (res.body.data.recentInquiries.length > 0) {
        const item = res.body.data.recentInquiries[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('email');
        expect(item).toHaveProperty('propertyTitle');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('createdAt');
      }
    });

    it('should return 0 for counts when database is empty', async () => {
      // beforeEach cleaned the DB, but this test doesn't seed properties
      // We need to ensure clean state
      await cleanDatabase(dataSource);
      const seeded = await seedTestUsers(dataSource);
      const cleanAdminToken = generateAccessToken(seeded.admin);

      const res = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(cleanAdminToken))
        .expect(200);

      expect(res.body.data.totalProperties).toBe(0);
      expect(res.body.data.totalInquiries).toBe(0);
      expect(res.body.data.newInquiries).toBe(0);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader('invalid-token'))
        .expect(401);
    });

    it('should return 403 when authenticated as renter (admin only)', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set(authHeader(renterToken))
        .expect(403);
    });
  });
});
