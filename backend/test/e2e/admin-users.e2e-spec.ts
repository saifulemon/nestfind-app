import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createTestApp, closeTestApp, getDataSource } from '../setup/test-app.factory';
import { cleanDatabase } from '../setup/test-database';
import { createTestUser, seedTestUsers, testUsers } from '../fixtures/user.fixture';
import { generateAccessToken, authHeader } from '../fixtures/auth.fixture';
import { User } from '../../src/modules/users/entities/user.entity';
import { RoleEnum } from '../../src/common/enums/role.enum';
import { UserStatusEnum } from '../../src/common/enums/user-status.enum';

import { AdminModule } from '../../src/modules/admin/admin.module';
import { AuthTestModule } from '../setup/auth-test.module';

describe('Admin Users E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;
  let adminUser: User;
  let renterUser: User;

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
    adminUser = seeded.admin;
    renterUser = seeded.renter;
    adminToken = generateAccessToken(adminUser);
    renterToken = generateAccessToken(renterUser);
  });

  // ─── GET /admin/users (List) ───────────────────────────────────────
  describe('GET /api/admin/users', () => {
    it('should return 200 with paginated users list (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Users retrieved successfully');
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('meta');
      expect(res.body.data.meta).toHaveProperty('total');
      expect(res.body.data.meta).toHaveProperty('page', 1);
      expect(res.body.data.meta).toHaveProperty('limit');
      expect(res.body.data.meta).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path', '/api/admin/users');
    });

    it('should return user items with correct shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set(authHeader(adminToken))
        .expect(200);

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('email');
        expect(item).toHaveProperty('phone');
        expect(item).toHaveProperty('role');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('emailVerifiedAt');
        expect(item).toHaveProperty('createdAt');
        // Admin user list should NOT expose passwords
        expect(item).not.toHaveProperty('password');
      }
    });

    it('should include all seeded users in list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set(authHeader(adminToken))
        .expect(200);

      // 4 users: renter, renter2, admin, suspendedRenter
      expect(res.body.data.meta.total).toBe(4);
    });

    it('should support filtering by role', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users?role=renter')
        .set(authHeader(adminToken))
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.role).toBe(RoleEnum.RENTER);
      }
    });

    it('should support filtering by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users?status=active')
        .set(authHeader(adminToken))
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.status).toBe('active');
      }
    });

    it('should support filtering by status=suspended', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users?status=suspended')
        .set(authHeader(adminToken))
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.status).toBe('suspended');
      }
    });

    it('should support search by name or email', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/users?search=${encodeURIComponent(renterUser.name)}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('should support sorting by newest', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users?sortBy=newest')
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should support sorting by oldest', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users?sortBy=oldest')
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should support sorting by name_asc', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users?sortBy=name_asc')
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should support sorting by name_desc', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users?sortBy=name_desc')
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should support pagination with page and limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users?page=1&limit=2')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(2);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users')
        .expect(401);
    });

    it('should return 403 when authenticated as renter (admin only)', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users')
        .set(authHeader(renterToken))
        .expect(403);
    });
  });

  // ─── GET /admin/users/:id (Detail) ─────────────────────────────────
  describe('GET /api/admin/users/:id', () => {
    it('should return 200 with full user detail (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/users/${renterUser.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('User retrieved successfully');
      expect(res.body.data).toHaveProperty('id', renterUser.id);
      expect(res.body.data).toHaveProperty('name', renterUser.name);
      expect(res.body.data).toHaveProperty('email', renterUser.email);
      expect(res.body.data).toHaveProperty('phone');
      expect(res.body.data).toHaveProperty('role', renterUser.role);
      expect(res.body.data).toHaveProperty('status', renterUser.status);
      expect(res.body.data).toHaveProperty('emailVerifiedAt');
      expect(res.body.data).toHaveProperty('activity');
      expect(res.body.data.activity).toHaveProperty('totalFavorites');
      expect(res.body.data.activity).toHaveProperty('totalInquiries');
      expect(res.body.data.activity).toHaveProperty('lastLoginAt');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return non-negative integers for activity counts', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/users/${renterUser.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(typeof res.body.data.activity.totalFavorites).toBe('number');
      expect(res.body.data.activity.totalFavorites).toBeGreaterThanOrEqual(0);
      expect(typeof res.body.data.activity.totalInquiries).toBe('number');
      expect(res.body.data.activity.totalInquiries).toBeGreaterThanOrEqual(0);
    });

    it('should show admin user correctly', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/users/${adminUser.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.role).toBe(RoleEnum.ADMIN);
      expect(res.body.data.status).toBe('active');
    });

    it('should show suspended user correctly', async () => {
      const suspended = await createTestUser(dataSource, testUsers.suspendedRenter);

      const res = await request(app.getHttpServer())
        .get(`/api/admin/users/${suspended.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.status).toBe('suspended');
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users/not-a-uuid')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/api/admin/users/${renterUser.id}`)
        .expect(401);
    });

    it('should return 403 when authenticated as renter (admin only)', async () => {
      await request(app.getHttpServer())
        .get(`/api/admin/users/${renterUser.id}`)
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when user not found', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  // ─── PATCH /admin/users/:id/status ─────────────────────────────────
  describe('PATCH /api/admin/users/:id/status', () => {
    it('should return 200 when suspending a user (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'suspended' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe("User status updated to 'suspended'");
      expect(res.body.data).toHaveProperty('id', renterUser.id);
      expect(res.body.data).toHaveProperty('name', renterUser.name);
      expect(res.body.data).toHaveProperty('email', renterUser.email);
      expect(res.body.data).toHaveProperty('status', 'suspended');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 200 when reactivating a suspended user', async () => {
      // First suspend
      await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'suspended' })
        .expect(200);

      // Then reactivate
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'active' })
        .expect(200);

      expect(res.body.data.status).toBe('active');
      expect(res.body.message).toBe("User status updated to 'active'");
    });

    it('should return 400 when status is missing', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .set(authHeader(adminToken))
        .send({})
        .expect(400);
    });

    it('should return 400 when status is invalid value', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'invalid-status' })
        .expect(400);
    });

    it('should return 400 when admin tries to suspend their own account', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/users/${adminUser.id}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'suspended' })
        .expect(400);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/users/not-a-uuid/status')
        .set(authHeader(adminToken))
        .send({ status: 'active' })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .send({ status: 'suspended' })
        .expect(401);
    });

    it('should return 403 when authenticated as renter (admin only)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/users/${renterUser.id}/status`)
        .set(authHeader(renterToken))
        .send({ status: 'suspended' })
        .expect(403);
    });

    it('should return 404 when user not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/users/00000000-0000-0000-0000-000000000000/status')
        .set(authHeader(adminToken))
        .send({ status: 'active' })
        .expect(404);
    });
  });
});
