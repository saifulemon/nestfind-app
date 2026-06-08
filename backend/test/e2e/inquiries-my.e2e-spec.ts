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
import { Property } from '../../src/modules/properties/entities/property.entity';

import { InquiryModule } from '../../src/modules/inquiries/inquiry.module';
import { AuthTestModule } from '../setup/auth-test.module';

/**
 * MISSING ENDPOINT from MISSING_ENDPOINTS.yaml:
 *   GET /api/inquiries/my — List inquiries submitted by the authenticated renter.
 *
 * Consumed by: frontend/app/pages/renter/inquiries.tsx
 */
describe('Inquiries My (Renter) E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;
  let renter2Token: string;
  let adminUser: User;
  let renterUser: User;
  let renter2User: User;
  let property1: Property;
  let property2: Property;

  beforeAll(async () => {
    const context = await createTestApp([AuthTestModule, InquiryModule]);
    app = context.app;
    module = context.module;
    dataSource = getDataSource(module);
  });

  afterAll(async () => {
    await closeTestApp({ app, module });
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    const seededUsers = await seedTestUsers(dataSource);
    adminUser = seededUsers.admin;
    renterUser = seededUsers.renter;
    renter2User = seededUsers.renter2;
    adminToken = generateAccessToken(adminUser);
    renterToken = generateAccessToken(renterUser);
    renter2Token = generateAccessToken(renter2User);

    const seededProps = await seedTestProperties(dataSource);
    property1 = seededProps.downtownApt;
    property2 = seededProps.suburbanHouse;
  });

  // ─── GET /inquiries/my (Renter's Own Inquiries) ────────────────────
  describe('GET /api/inquiries/my', () => {
    beforeEach(async () => {
      // Renter1 submits inquiries on property1 and property2
      await request(app.getHttpServer())
        .post(`/api/properties/${property1.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'First inquiry from renter1 about property1.' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/properties/${property2.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Second inquiry from renter1 about property2.' })
        .expect(201);

      // Renter2 submits an inquiry on property1 (should NOT appear in renter1's list)
      await request(app.getHttpServer())
        .post(`/api/properties/${property1.id}/inquiries`)
        .set(authHeader(renter2Token))
        .send({ message: 'Inquiry from renter2 about property1.' })
        .expect(201);
    });

    it('should return 200 with paginated inquiries list (renter only)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(renterToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toMatch(/inquiries/i);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('meta');
      expect(res.body.data.meta).toHaveProperty('total');
      expect(res.body.data.meta).toHaveProperty('page');
      expect(res.body.data.meta).toHaveProperty('limit');
      expect(res.body.data.meta).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should return inquiry items with correct shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(renterToken))
        .expect(200);

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('property');
        expect(item.property).toHaveProperty('id');
        expect(item.property).toHaveProperty('title');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('email');
        expect(item).toHaveProperty('phone');
        expect(item).toHaveProperty('message');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('response');
        expect(item).toHaveProperty('respondedAt');
        expect(item).toHaveProperty('createdAt');
      }
    });

    it('should only return inquiries for the authenticated renter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(renterToken))
        .expect(200);

      // Renter1 should see exactly 2 inquiries (their own)
      expect(res.body.data.meta.total).toBe(2);
      expect(res.body.data.items).toHaveLength(2);

      // All inquiries should belong to renter1
      for (const item of res.body.data.items) {
        expect(item.email).toBe(renterUser.email);
      }
    });

    it('should not include inquiries from other renters', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(renterToken))
        .expect(200);

      const messages = res.body.data.items.map((i: any) => i.message);
      expect(messages).not.toContain('Inquiry from renter2 about property1.');
    });

    it('should return empty items array when renter has no inquiries', async () => {
      // Use a fresh user with no inquiries
      const freshUser = await createTestUser(dataSource, {
        name: 'Fresh Renter',
        email: 'fresh@test.com',
        password: 'TestPass123!',
        role: testUsers.renter.role,
        status: testUsers.renter.status,
      });
      const freshToken = generateAccessToken(freshUser);

      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(freshToken))
        .expect(200);

      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.meta.total).toBe(0);
    });

    it('should support pagination with page and limit', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my?page=1&limit=1')
        .set(authHeader(renterToken))
        .expect(200);

      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(1);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.meta.total).toBe(2);
    });

    it('should support sorting', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my?sortBy=newest')
        .set(authHeader(renterToken))
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid pagination params', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries/my?limit=9999')
        .set(authHeader(renterToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader('invalid-token'))
        .expect(401);
    });

    it('should return 403 when authenticated as admin (renter only)', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(adminToken))
        .expect(403);
    });

    it('should include response data when admin has responded', async () => {
      // Submit an inquiry
      const submitRes = await request(app.getHttpServer())
        .post(`/api/properties/${property1.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Inquiry that will get a response.' })
        .expect(201);

      const inquiryId = submitRes.body.data.id;

      // Admin responds
      await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .set(authHeader(adminToken))
        .send({ response: 'Thank you for your interest. The property is still available.' })
        .expect(200);

      // Renter fetches their inquiries
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(renterToken))
        .expect(200);

      const respondedInquiry = res.body.data.items.find(
        (i: any) => i.id === inquiryId,
      );
      expect(respondedInquiry).toBeDefined();
      expect(respondedInquiry.status).toBe('responded');
      expect(respondedInquiry.response).toBeTruthy();
      expect(respondedInquiry.respondedAt).toBeTruthy();
    });

    it('should include property title for each inquiry', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries/my')
        .set(authHeader(renterToken))
        .expect(200);

      const propertyIds = res.body.data.items.map((i: any) => i.property.id);
      expect(propertyIds).toContain(property1.id);
      expect(propertyIds).toContain(property2.id);

      for (const item of res.body.data.items) {
        expect(item.property).toHaveProperty('title');
      }
    });
  });

});
