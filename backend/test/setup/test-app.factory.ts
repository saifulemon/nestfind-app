import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from '../../src/core/filters/http-exception.filter';
import { AllExceptionsFilter } from '../../src/core/filters/all-exceptions.filter';
import { TransformInterceptor } from '../../src/core/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../../src/core/interceptors/logging.interceptor';
import jwtConfig from '../../src/config/jwt.config';

// Import all entities for the test database
import { User } from '../../src/modules/users/entities/user.entity';
import { RefreshToken } from '../../src/modules/auth/entities/refresh-token.entity';
import { PasswordResetToken } from '../../src/modules/auth/entities/password-reset-token.entity';
import { Property } from '../../src/modules/properties/entities/property.entity';
import { PropertyPhoto } from '../../src/modules/properties/entities/property-photo.entity';
import { Amenity } from '../../src/modules/properties/entities/amenity.entity';
import { PropertyAmenity } from '../../src/modules/properties/entities/property-amenity.entity';
import { Favorite } from '../../src/modules/favorites/entities/favorite.entity';
import { Inquiry } from '../../src/modules/inquiries/entities/inquiry.entity';

export interface TestAppContext {
  app: INestApplication;
  module: TestingModule;
}

/**
 * Creates a NestJS test application with all entities registered against
 * an in-memory SQLite database (no external PostgreSQL dependency for tests).
 *
 * Accepts optional feature modules to register. When modules don't exist yet
 * (RED phase), pass an empty array — the test app will start but routes
 * won't be registered, causing all requests to 404.
 */
export async function createTestApp(
  featureModules: any[] = [],
): Promise<TestAppContext> {
  // Ensure JWT_SECRET is set for JwtStrategy (required by jwt.config.ts)
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-tests';
  }
  if (!process.env.AUTH_JWT_SECRET) {
    process.env.AUTH_JWT_SECRET = 'test-jwt-secret-for-e2e-tests';
  }
  if (!process.env.ALLOW_ORIGINS) {
    process.env.ALLOW_ORIGINS = 'http://localhost:5173,http://localhost:3000';
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig], ignoreEnvFile: true }),
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: [
          User,
          RefreshToken,
          PasswordResetToken,
          Property,
          PropertyPhoto,
          Amenity,
          PropertyAmenity,
          Favorite,
          Inquiry,
        ],
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([
        User,
        RefreshToken,
        PasswordResetToken,
        Property,
        PropertyPhoto,
        Amenity,
        PropertyAmenity,
        Favorite,
        Inquiry,
      ]),
      ...featureModules,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  await app.init();

  return { app, module: moduleFixture };
}

/**
 * Gracefully closes the test application and module.
 */
export async function closeTestApp(context: TestAppContext): Promise<void> {
  await context.app.close();
}

/**
 * Returns the TypeORM DataSource from the test module for direct DB access.
 */
export function getDataSource(module: TestingModule): DataSource {
  return module.get(DataSource);
}
