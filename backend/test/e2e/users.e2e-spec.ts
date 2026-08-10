import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../utils/test-utils';

describe('Users Module E2E Test Suite (/api/users)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

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
