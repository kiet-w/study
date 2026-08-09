# NestJS Backend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the StudySnap backend in `backend/` from Express to a structured NestJS application with Prisma ORM, Class-Validator DTOs, Swagger documentation, and updated documentation in `AGENTS.md`.

**Architecture:** A modular NestJS project structure using `PrismaModule` as the database layer for Supabase PostgreSQL tables (`categories`, `topics`, `photos`). Controller endpoints are documented with `@nestjs/swagger` and validated with `class-validator`.

**Tech Stack:** NestJS 10, TypeScript 5, Prisma ORM, Class-Validator, Class-Transformer, Swagger UI (@nestjs/swagger).

## Global Constraints

- Target directory: `backend/`
- Documentation files: `AGENTS.md`, `.agents/rules/07-backend-stack.md`
- Database schema: `backend/prisma/schema.prisma`

---

### Task 1: Update AGENTS.md Rules & NestJS Scaffolding Configs

**Files:**
- Modify: `AGENTS.md`
- Modify: `.agents/rules/07-backend-stack.md`
- Modify: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nest-cli.json`

- [ ] **Step 1: Update AGENTS.md with NestJS backend architecture**
- Update Section 1 Stack and Section 2 Directory Structure in `AGENTS.md` to indicate NestJS + Prisma for `backend/`.

- [ ] **Step 2: Update .agents/rules/07-backend-stack.md**
- Update rule documentation to detail NestJS backend conventions.

- [ ] **Step 3: Configure backend/package.json for NestJS**
- Add NestJS dependencies (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `@prisma/client`, `prisma`, `reflect-metadata`, `rxjs`, `swagger-ui-express`).

- [ ] **Step 4: Configure backend/tsconfig.json and nest-cli.json**
- Enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`.

---

### Task 2: Implement PrismaModule, Global Utilities & Main Entrypoint

**Files:**
- Create: `backend/src/shared/prisma/prisma.service.ts`
- Create: `backend/src/shared/prisma/prisma.module.ts`
- Create: `backend/src/shared/filters/http-exception.filter.ts`
- Create: `backend/src/shared/interceptors/transform.interceptor.ts`
- Create: `backend/src/modules/health/health.controller.ts`
- Create: `backend/src/modules/health/health.module.ts`
- Create: `backend/src/app.module.ts`
- Create: `backend/src/main.ts`

- [ ] **Step 1: Create PrismaService & PrismaModule**
- Create `PrismaService` extending `PrismaClient` with `OnModuleInit` and `OnModuleDestroy`.
- Export `PrismaService` from `@Global()` `PrismaModule`.

- [ ] **Step 2: Create Global Exception Filter and Response Interceptor**
- `HttpExceptionFilter` formats errors as `{ statusCode, message, timestamp, path }`.
- `TransformInterceptor` wraps successful responses in `{ data, success: true }`.

- [ ] **Step 3: Implement HealthModule and Main Application Entrypoint**
- Create `HealthController` handling `GET /health`.
- Wire `main.ts` with `ValidationPipe({ whitelist: true, transform: true })`, Swagger builder at `/api/docs`, and global prefix `/api`.

---

### Task 3: Implement Users, Categories, and Topics Feature Modules

**Files:**
- Create: `backend/src/modules/users/dto/create-user.dto.ts`
- Create: `backend/src/modules/users/users.service.ts`
- Create: `backend/src/modules/users/users.controller.ts`
- Create: `backend/src/modules/users/users.module.ts`
- Create: `backend/src/modules/categories/dto/create-category.dto.ts`
- Create: `backend/src/modules/categories/dto/update-category.dto.ts`
- Create: `backend/src/modules/categories/categories.service.ts`
- Create: `backend/src/modules/categories/categories.controller.ts`
- Create: `backend/src/modules/categories/categories.module.ts`
- Create: `backend/src/modules/topics/dto/create-topic.dto.ts`
- Create: `backend/src/modules/topics/dto/update-topic.dto.ts`
- Create: `backend/src/modules/topics/topics.service.ts`
- Create: `backend/src/modules/topics/topics.controller.ts`
- Create: `backend/src/modules/topics/topics.module.ts`

- [ ] **Step 1: Implement UsersModule**
- CRUD operations for users via Prisma client.

- [ ] **Step 2: Implement CategoriesModule**
- Category DTOs (`CreateCategoryDto`, `UpdateCategoryDto`) with `class-validator` annotations (`@IsString`, `@IsOptional`, `@IsUUID`, `@IsInt`).
- Service methods: `create`, `findAll`, `findOne`, `update`, `remove`.
- Controller with Swagger annotations (`@ApiTags('categories')`).

- [ ] **Step 3: Implement TopicsModule**
- Topic DTOs (`CreateTopicDto`, `UpdateTopicDto`).
- Service methods: `create`, `findAll`, `findOne`, `update`, `remove`.
- Controller with Swagger annotations (`@ApiTags('topics')`).

---

### Task 4: Implement Photos Feature Module

**Files:**
- Create: `backend/src/modules/photos/dto/create-photo.dto.ts`
- Create: `backend/src/modules/photos/dto/update-photo.dto.ts`
- Create: `backend/src/modules/photos/dto/query-photos.dto.ts`
- Create: `backend/src/modules/photos/photos.service.ts`
- Create: `backend/src/modules/photos/photos.controller.ts`
- Create: `backend/src/modules/photos/photos.module.ts`

- [ ] **Step 1: Create Photo DTOs**
- `CreatePhotoDto` with validation (`userId`, `storagePath`, `takenAt`, `categoryId`, `topicId`, `note`).
- `QueryPhotosDto` supporting filtering by `userId`, `categoryId`, `topicId`, `synced`, and pagination (`page`, `limit`).

- [ ] **Step 2: Implement PhotosService & Controller**
- PhotosService querying Prisma model `photo` with relationships (`category`, `topic`).
- Controller handling `GET /api/photos`, `POST /api/photos`, `GET /api/photos/:id`, `PATCH /api/photos/:id`, `DELETE /api/photos/:id`.

---

### Task 5: Build Verification and Integration Check

**Files:**
- Modify: `backend/src/app.module.ts` (Import all feature modules)

- [ ] **Step 1: Wire all modules into AppModule**
- Import `PrismaModule`, `HealthModule`, `UsersModule`, `CategoriesModule`, `TopicsModule`, and `PhotosModule`.

- [ ] **Step 2: Run npm install and build verification**
- Execute `npm install` and `npm run build` inside `backend/` to verify zero TypeScript errors.
