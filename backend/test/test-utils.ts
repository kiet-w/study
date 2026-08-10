import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
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
  return app;
}

export const TEST_USER_A = 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab';
export const TEST_USER_B = 'b9c8d7e6-f5a4-4b3c-8d1e-9876543210fe';
