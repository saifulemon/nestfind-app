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
import { Inquiry } from '../../src/modules/inquiries/entities/inquiry.entity';

import { InquiryModule } from '../../src/modules/inquiries/inquiry.module';
import { AuthTestModule } from '../setup/auth-test.module';

describe('Inquiries E2E', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let adminToken: string;
  let renterToken: string;
  let adminUser: User;
  let renterUser: User;
  let property: Property;

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
    adminToken = generateAccessToken(adminUser);
    renterToken = generateAccessToken(renterUser);

    const seededProps = await seedTestProperties(dataSource);
    property = seededProps.downtownApt;
  });

  // ─── POST /properties/:id/inquiries (Submit) ────────────────────
  describe('POST /api/properties/:id/inquiries', () => {
    const validBody = {
      message: 'I am interested in this property. Is it still available?',
    };

    it('should return 201 with inquiry data (renter only)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send(validBody)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe('Inquiry submitted successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('propertyId');
      expect(res.body.data).toHaveProperty('name', renterUser.name);
      expect(res.body.data).toHaveProperty('email', renterUser.email);
      expect(res.body.data).toHaveProperty('phone');
      expect(res.body.data).toHaveProperty('message', validBody.message);
      expect(res.body.data).toHaveProperty('status', 'new');
      expect(res.body.data).toHaveProperty('response', null);
      expect(res.body.data).toHaveProperty('respondedAt', null);
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('should denormalize user profile data into the inquiry', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send(validBody)
        .expect(201);

      expect(res.body.data.name).toBe(renterUser.name);
      expect(res.body.data.email).toBe(renterUser.email);
    });

    it('should allow overriding name, email, phone in request body', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({
          ...validBody,
          name: 'Custom Name',
          email: 'custom@example.com',
          phone: '+15559999999',
        })
        .expect(201);

      expect(res.body.data.name).toBe('Custom Name');
      expect(res.body.data.email).toBe('custom@example.com');
      expect(res.body.data.phone).toBe('+15559999999');
    });

    it('should return 400 when message is missing', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({})
        .expect(400);
    });

    it('should return 400 when message is too short (< 10 chars)', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Short' })
        .expect(400);
    });

    it('should return 400 when message is too long (> 2000 chars)', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'X'.repeat(2001) })
        .expect(400);
    });

    it('should return 400 for invalid property UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/properties/not-a-uuid/inquiries')
        .set(authHeader(renterToken))
        .send(validBody)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .send(validBody)
        .expect(401);
    });

    it('should return 403 when authenticated as admin (renter only)', async () => {
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(adminToken))
        .send(validBody)
        .expect(403);
    });

    it('should return 404 when property not found', async () => {
      await request(app.getHttpServer())
        .post('/api/properties/00000000-0000-0000-0000-000000000000/inquiries')
        .set(authHeader(renterToken))
        .send(validBody)
        .expect(404);
    });
  });

  // ─── GET /inquiries (List All - Admin) ────────────────────────────
  describe('GET /api/inquiries', () => {
    beforeEach(async () => {
      // Submit an inquiry so the list is not empty
      await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Test inquiry for listing.' })
        .expect(201);
    });

    it('should return 200 with paginated inquiries list (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Inquiries retrieved successfully');
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
        .get('/api/inquiries')
        .set(authHeader(adminToken))
        .expect(200);

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('property');
        expect(item.property).toHaveProperty('id');
        expect(item.property).toHaveProperty('title');
        expect(item).toHaveProperty('renter');
        expect(item.renter).toHaveProperty('id');
        expect(item.renter).toHaveProperty('name');
        expect(item.renter).toHaveProperty('email');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('email');
        expect(item).toHaveProperty('phone');
        expect(item).toHaveProperty('message');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('response');
        expect(item).toHaveProperty('respondedAt');
        expect(item).toHaveProperty('createdAt');
        expect(item).toHaveProperty('updatedAt');
      }
    });

    it('should support filtering by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries?status=new')
        .set(authHeader(adminToken))
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.status).toBe('new');
      }
    });

    it('should support filtering by propertyId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/inquiries?propertyId=${property.id}`)
        .set(authHeader(adminToken))
        .expect(200);

      for (const item of res.body.data.items) {
        expect(item.property.id).toBe(property.id);
      }
    });

    it('should support search by name or email', async () => {
      await request(app.getHttpServer())
        .get(`/api/inquiries?search=${encodeURIComponent(renterUser.name)}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should support sorting', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries?sortBy=newest')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inquiries?page=1&limit=10')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(10);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries')
        .expect(401);
    });

    it('should return 403 when authenticated as renter (admin only)', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries')
        .set(authHeader(renterToken))
        .expect(403);
    });
  });

  // ─── GET /inquiries/:id (Detail - Admin) ─────────────────────────
  describe('GET /api/inquiries/:id', () => {
    let inquiryId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Detail inquiry test message.' })
        .expect(201);
      inquiryId = res.body.data.id;
    });

    it('should return 200 with inquiry detail (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/inquiries/${inquiryId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Inquiry retrieved successfully');
      expect(res.body.data).toHaveProperty('id', inquiryId);
      expect(res.body.data).toHaveProperty('property');
      expect(res.body.data).toHaveProperty('renter');
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('message');
      expect(res.body.data).toHaveProperty('status', 'new');
      expect(res.body.data).toHaveProperty('response');
      expect(res.body.data).toHaveProperty('respondedAt');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries/not-a-uuid')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/api/inquiries/${inquiryId}`)
        .expect(401);
    });

    it('should return 403 when authenticated as renter (admin only)', async () => {
      await request(app.getHttpServer())
        .get(`/api/inquiries/${inquiryId}`)
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when inquiry not found', async () => {
      await request(app.getHttpServer())
        .get('/api/inquiries/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  // ─── PATCH /inquiries/:id/read (Mark as Read) ────────────────────
  describe('PATCH /api/inquiries/:id/read', () => {
    let inquiryId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Mark as read inquiry test.' })
        .expect(201);
      inquiryId = res.body.data.id;
    });

    it('should return 200 when inquiry marked as read (admin only)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/inquiries/${inquiryId}/read`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Inquiry marked as read');
      expect(res.body.data).toHaveProperty('id', inquiryId);
      expect(res.body.data).toHaveProperty('status', 'read');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .patch('/api/inquiries/not-a-uuid/read')
        .set(authHeader(adminToken))
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/api/inquiries/${inquiryId}/read`)
        .expect(401);
    });

    it('should return 403 when authenticated as renter', async () => {
      await request(app.getHttpServer())
        .patch(`/api/inquiries/${inquiryId}/read`)
        .set(authHeader(renterToken))
        .expect(403);
    });

    it('should return 404 when inquiry not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/inquiries/00000000-0000-0000-0000-000000000000/read')
        .set(authHeader(adminToken))
        .expect(404);
    });

    it('should return 400 when inquiry is already read or responded', async () => {
      // Mark as read first
      await request(app.getHttpServer())
        .patch(`/api/inquiries/${inquiryId}/read`)
        .set(authHeader(adminToken))
        .expect(200);

      // Try to mark as read again
      await request(app.getHttpServer())
        .patch(`/api/inquiries/${inquiryId}/read`)
        .set(authHeader(adminToken))
        .expect(400);
    });
  });

  // ─── POST /inquiries/:id/respond ──────────────────────────────────
  describe('POST /api/inquiries/:id/respond', () => {
    let inquiryId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/properties/${property.id}/inquiries`)
        .set(authHeader(renterToken))
        .send({ message: 'Response inquiry test message.' })
        .expect(201);
      inquiryId = res.body.data.id;
    });

    it('should return 200 when admin responds to inquiry', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .set(authHeader(adminToken))
        .send({ response: 'Thank you for your interest. The property is available.' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.message).toBe('Response sent successfully');
      expect(res.body.data).toHaveProperty('id', inquiryId);
      expect(res.body.data).toHaveProperty('status', 'responded');
      expect(res.body.data).toHaveProperty('response');
      expect(res.body.data).toHaveProperty('respondedAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 when response is missing', async () => {
      await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .set(authHeader(adminToken))
        .send({})
        .expect(400);
    });

    it('should return 400 when response is too short (< 10 chars)', async () => {
      await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .set(authHeader(adminToken))
        .send({ response: 'Short' })
        .expect(400);
    });

    it('should return 400 when response is too long (> 5000 chars)', async () => {
      await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .set(authHeader(adminToken))
        .send({ response: 'X'.repeat(5001) })
        .expect(400);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/inquiries/not-a-uuid/respond')
        .set(authHeader(adminToken))
        .send({ response: 'Valid response text here.' })
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .send({ response: 'Unauthenticated response.' })
        .expect(401);
    });

    it('should return 403 when authenticated as renter', async () => {
      await request(app.getHttpServer())
        .post(`/api/inquiries/${inquiryId}/respond`)
        .set(authHeader(renterToken))
        .send({ response: 'Renter cannot respond.' })
        .expect(403);
    });

    it('should return 404 when inquiry not found', async () => {
      await request(app.getHttpServer())
        .post('/api/inquiries/00000000-0000-0000-0000-000000000000/respond')
        .set(authHeader(adminToken))
        .send({ response: 'Valid response text here.' })
        .expect(404);
    });
  });
});
