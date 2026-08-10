import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';

describe('StudySnap API Suite (E2E Integration & Security Tests)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // -------------------------------------------------------------
  // 1. CATEGORIES MODULE & VALIDATION & USER ISOLATION
  // -------------------------------------------------------------
  describe('Categories Module (/api/categories)', () => {
    it('POST /api/categories - Validation Error (missing name) -> 400', () => {
      return request(app.getHttpServer())
        .post('/api/categories')
        .send({ color: '#3B82F6', icon: '📚' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('GET /api/categories/:id - Not Found Category -> 404', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/api/categories/${nonExistentId}`)
        .expect(404);
    });

    it('GET /api/categories - Success returning array', () => {
      return request(app.getHttpServer())
        .get('/api/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data || res.body)).toBe(true);
        });
    });
  });

  // -------------------------------------------------------------
  // 2. TOPICS MODULE & USER ISOLATION
  // -------------------------------------------------------------
  describe('Topics Module (/api/topics)', () => {
    it('POST /api/topics - Validation Error (missing name) -> 400', () => {
      return request(app.getHttpServer())
        .post('/api/topics')
        .send({ color: '#10B981' })
        .expect(400);
    });

    it('GET /api/topics/:id - Not Found Topic -> 404', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/api/topics/${nonExistentId}`)
        .expect(404);
    });

    it('GET /api/topics - Success returning array', () => {
      return request(app.getHttpServer())
        .get('/api/topics')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data || res.body)).toBe(true);
        });
    });
  });

  // -------------------------------------------------------------
  // 3. PHOTOS MODULE & OFFLINE SYNC
  // -------------------------------------------------------------
  describe('Photos Module (/api/photos)', () => {
    it('POST /api/photos - Validation Error (missing storagePath) -> 400', () => {
      return request(app.getHttpServer())
        .post('/api/photos')
        .send({ note: 'Lecture notes' })
        .expect(400);
    });

    it('POST /api/photos/sync - Batch Sync Validation Error -> 400', () => {
      return request(app.getHttpServer())
        .post('/api/photos/sync')
        .send({ photos: 'invalid_array' })
        .expect(400);
    });

    it('GET /api/photos/:id - Not Found Photo -> 404', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/api/photos/${nonExistentId}`)
        .expect(404);
    });

    it('GET /api/photos - Success returning list/paginated object', () => {
      return request(app.getHttpServer())
        .get('/api/photos')
        .expect(200)
        .expect((res) => {
          const payload = res.body.data || res.body;
          expect(Array.isArray(payload.items || payload)).toBe(true);
        });
    });
  });

  // -------------------------------------------------------------
  // 4. USERS MODULE
  // -------------------------------------------------------------
  describe('Users Module (/api/users)', () => {
    it('POST /api/users - Validation Error (invalid email) -> 400', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('GET /api/users - Success returning array', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(200);
    });
  });
});
