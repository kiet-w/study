# NestJS Backend Design Specification

**Date:** 2026-08-09  
**Status:** Approved  
**Target:** `backend/` directory  

---

## 1. Overview & Objectives

Convert the existing Express backend in `backend/` to a structured, modular **NestJS** application with TypeScript, Prisma ORM, Class-Validator DTOs, dynamic Swagger documentation, and structured error handling.

Updating `AGENTS.md` and `.agents/rules/07-backend-stack.md` to reflect NestJS as the standard backend stack.

---

## 2. Directory Structure (`backend/`)

```
backend/
├── package.json               # NestJS 10+ dependencies, scripts
├── tsconfig.json              # TypeScript config with decorators enabled
├── nest-cli.json              # Nest CLI configuration
├── prisma/
│   └── schema.prisma          # Database schema (Category, Topic, Photo)
├── src/
│   ├── main.ts                # Application entrypoint (Swagger, validation pipe, CORS, prefix)
│   ├── app.module.ts          # Root module registering all feature modules
│   ├── shared/
│   │   ├── prisma/            # PrismaModule & PrismaService
│   │   ├── filters/           # Global exception filter (HttpExceptionFilter)
│   │   └── interceptors/      # TransformInterceptor for standardized responses
│   └── modules/
│       ├── health/            # Health check endpoint (/health)
│       ├── users/             # User module (Controller, Service, DTOs)
│       ├── categories/        # Category module (Controller, Service, DTOs)
│       ├── topics/            # Topic module (Controller, Service, DTOs)
│       └── photos/            # Photo module (Controller, Service, DTOs)
```

---

## 3. Module Specifications

### 3.1 `PrismaModule` (`shared/prisma`)
- Global NestJS module providing `PrismaService`.
- Handles connection lifecycle (`onModuleInit`, `onModuleDestroy`).

### 3.2 `HealthModule` (`modules/health`)
- GET `/health` returning `{ status: 'ok', timestamp: string, uptime: number }`.

### 3.3 `UsersModule` (`modules/users`)
- GET `/api/users`: List users / get profile.
- POST `/api/users`: Create/sync user profile.
- GET `/api/users/:id`: Get user details.

### 3.4 `CategoriesModule` (`modules/categories`)
- GET `/api/categories`: List categories (with optional `userId` filter).
- POST `/api/categories`: Create category (DTO with `name`, `color`, `icon`, `sortOrder`).
- GET `/api/categories/:id`: Get category by ID.
- PATCH `/api/categories/:id`: Update category.
- DELETE `/api/categories/:id`: Remove category.

### 3.5 `TopicsModule` (`modules/topics`)
- GET `/api/topics`: List topics (with optional `categoryId`, `userId` filter).
- POST `/api/topics`: Create topic.
- GET `/api/topics/:id`: Get topic detail.
- PATCH `/api/topics/:id`: Update topic.
- DELETE `/api/topics/:id`: Delete topic.

### 3.6 `PhotosModule` (`modules/photos`)
- GET `/api/photos`: List photos (with pagination, filters by `categoryId`, `topicId`, `synced`).
- POST `/api/photos`: Create photo metadata.
- GET `/api/photos/:id`: Get photo by ID.
- PATCH `/api/photos/:id`: Update photo (notes, categoryId, topicId, sync status).
- DELETE `/api/photos/:id`: Delete photo.

---

## 4. Documentation & Agent Rules Update

- **`AGENTS.md`**: Update Section 1 Stack and Section 2 Directory Structure to reflect NestJS for `backend/`.
- **`.agents/rules/07-backend-stack.md`**: Update backend architecture description to NestJS + Prisma.

---

## 5. Execution Strategy via Subagents

- **Phase A (Setup & Rules)**:
  - Update `AGENTS.md` & `.agents/rules/07-backend-stack.md`.
  - Re-scaffold `backend/package.json`, `backend/tsconfig.json`, `backend/nest-cli.json`.
  - Implement `PrismaService`, `PrismaModule`, Global Filters, `main.ts`, and `HealthModule`.

- **Phase B (Parallel Subagents)**:
  - **Subagent 1**: Implement `UsersModule`, `CategoriesModule`, and `TopicsModule` with NestJS Controllers, Services, DTOs with `class-validator`, and Swagger annotations.
  - **Subagent 2**: Implement `PhotosModule` with NestJS Controller, Service, DTOs, query filtering, pagination, and Swagger annotations.

- **Phase C (Verification & Build)**:
  - Run `npm run build` inside `backend/` to verify TypeScript compilation and NestJS module wiring.
