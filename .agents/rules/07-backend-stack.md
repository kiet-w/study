# Rule 07 — Backend Tech Stack (NestJS + Prisma ORM + Supabase)

> **Phạm vi:** Phát triển NestJS API backend (`backend/`), Prisma ORM, Supabase Database, và AI Service (Phase 4+).  
> **Nguồn sự thật chi tiết:** `docs/02-backend-supabase/` & `backend/src/`

---

## Phần 0: Cấu Trúc & Kiến Trúc NestJS Backend (`backend/`)

Backend được thiết kế theo chuẩn **NestJS Modular Architecture** với **Prisma ORM** tương tác trực tiếp với Supabase PostgreSQL Database.

### 1. Thư mục mã nguồn thực tế (`backend/src/`)

```
backend/
├── src/
│   ├── main.ts                       # Entrypoint app: NestFactory, ValidationPipe, Swagger, CORS
│   ├── app.module.ts                 # Root AppModule: Import Config, Prisma, Feature modules
│   │
│   ├── modules/                      # Feature modules độc lập (FSD backend style)
│   │   ├── users/                    # Quản lý thông tin user profile & account (UsersModule)
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── categories/               # Quản lý danh mục/môn học (CategoriesModule)
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   └── dto/
│   │   │       ├── create-category.dto.ts
│   │   │       └── update-category.dto.ts
│   │   ├── topics/                   # Quản lý chủ đề/chương (TopicsModule)
│   │   │   ├── topics.module.ts
│   │   │   ├── topics.controller.ts
│   │   │   ├── topics.service.ts
│   │   │   └── dto/
│   │   │       ├── create-topic.dto.ts
│   │   │       └── update-topic.dto.ts
│   │   └── photos/                   # Quản lý ảnh bài giảng & sync status (PhotosModule)
│   │       ├── photos.module.ts
│   │       ├── photos.controller.ts
│   │       ├── photos.service.ts
│   │       └── dto/
│   │           ├── create-photo.dto.ts
│   │           ├── update-photo.dto.ts
│   │           ├── query-photos.dto.ts
│   │           └── batch-sync-photos.dto.ts
│   │
│   └── shared/                       # Shared modules, Interceptors, Filters, Types
│       ├── prisma/
│       │   ├── prisma.module.ts      # @Global() PrismaModule
│       │   └── prisma.service.ts     # PrismaService extends PrismaClient
│       ├── filters/
│       │   └── http-exception.filter.ts # Global Exception Filter
│       ├── interceptors/
│       │   └── transform.interceptor.ts # Response Wrapper Interceptor
│       └── types/
│           └── common.types.ts
│
├── prisma/
│   └── schema.prisma                 # Prisma ORM Database Schema
├── nest-cli.json                     # Nest CLI configuration
├── tsconfig.json                     # TypeScript compiler options (Decorators enabled)
└── package.json                      # NestJS & Prisma dependencies
```

---

## Phần 1: Nguyên Tắc & Chuẩn Code NestJS (Core Guidelines)

### 1. Dependency Injection & Modular Architecture
- Mỗi feature lớn là một module độc lập chứa: `*.module.ts`, `*.controller.ts`, `*.service.ts`, và thư mục `dto/`.
- `PrismaModule` là `@Global()` module trong `src/shared/prisma/prisma.module.ts`. Không import thủ công `PrismaClient` trong service; luôn inject `PrismaService`.

### 2. DTO & Input Validation Rules
- Mọi request payload gửi lên Controller (Body, Query, Param) **bắt buộc** phải sử dụng DTO class.
- Sử dụng `class-validator` và `class-transformer` decorator trên DTO:
  - `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsUUID()`, `@IsInt()`, `@IsBoolean()`.
  - `@Type(() => Number)` hoặc `@Type(() => Boolean)` đối với Query parameters.
- Phải gắn `@ApiProperty()` hoặc `@ApiPropertyOptional()` từ `@nestjs/swagger` để tự động render tài liệu API.
- `ValidationPipe` được bật toàn cục trong `main.ts` với options:
  ```ts
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  })
  ```

### 3. API Documentation (Swagger / OpenAPI)
- Swagger UI có sẵn tại endpoint `/api/docs`.
- Tất cả Controllers phải khai báo:
  - `@ApiTags('Feature Name')` trên class Controller.
  - `@ApiOperation({ summary: 'Mô tả ngắn gọn' })` trên từng method handler.
  - `@ApiResponse({ status: 200/201/400/404, description: '...' })`.

### 4. Response & Error Handling Standard
- Tất cả thành công được wrap tự động bởi `TransformInterceptor`:
  ```json
  {
    "statusCode": 200,
    "data": { ... },
    "timestamp": "2026-08-09T14:00:00.000Z"
  }
  ```
- Tất cả lỗi HTTP exception được xử lý tập trung qua `HttpExceptionFilter`:
  ```json
  {
    "statusCode": 400,
    "message": ["name should not be empty"],
    "error": "Bad Request",
    "timestamp": "2026-08-09T14:00:00.000Z",
    "path": "/api/categories"
  }
  ```

---

## Phần 2: Prisma ORM Standard Practices (`backend/prisma/schema.prisma`)

### 1. Quy tắc đặt tên Schema & Mapping
- Tên Model dùng `PascalCase` (`User`, `Category`, `Topic`, `Photo`).
- Bảng Database PostgreSQL dùng `snake_case` thông qua `@@map("table_name")` (`@map("users")`, `@map("categories")`, `@map("photos")`).
- Tên trường trong DB dùng `@map("user_id")`, `@map("created_at")` để giữ sự tương thích với Supabase SQL schema.

### 2. UUID & Primary Keys
- Sử dụng UUID mặc định phát sinh từ PostgreSQL:
  `id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`

### 3. Quan hệ User 1-N & Database Mapping
- Model `User` liên kết 1-N với `Category`, `Topic`, `Photo`.
- Khai báo FK `userId String @map("user_id") @db.Uuid` trên các bảng và thiết lập `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`.
- Đánh chỉ mục `@@index([userId])` trên các bảng con để tối ưu hóa truy vấn theo người dùng.

---

## Phần 3: Tích hợp Supabase (Auth, RLS, Storage)

### 1. Supabase Database Connection
Config trong `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgboiler=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
```

### 2. Storage Buckets (PRIVATE)
- `photos` (Private bucket chứa ảnh bài giảng gốc)
- `thumbnails` (Private bucket chứa ảnh xem trước đã nén)
- Truy cập qua Signed URLs sinh từ Supabase Storage SDK hoặc client-side.

---

## Phần 4: Quy Trình Phát Triển & Chạy Dev Backend

```bash
cd backend

# 1. Cài đặt dependencies
npm install

# 2. Sinh Prisma Client từ schema
npx prisma generate

# 3. Đẩy thay đổi schema lên Supabase DB (Dev)
npx prisma db push

# 4. Chạy NestJS dev server với hot reload
npm run dev

# 5. Truy cập Swagger API Documentation
# http://localhost:3000/api/docs
```

---

## Phần 5: Quy Tắc Cô Lập Dữ Liệu Người Dùng (User Data Isolation Rule)

1. **Nguyên tắc cốt lõi:** Người dùng A **tuyệt đối không được phép đọc, sửa, hoặc xóa** dữ liệu của Người dùng B.
2. **Implementation trong Service:**
   - Khi tìm kiếm đơn lẻ (`findOne`), cập nhật (`update`), hoặc xóa (`remove`), **luôn luôn truyền và lọc theo `userId`**:
     ```ts
     // ✅ BẮT BUỘC: Lọc kết hợp id và userId
     const category = await this.prisma.category.findFirst({
       where: {
         id,
         ...(userId && { userId }),
       },
     });
     if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
     ```
   - Nếu `id` không thuộc sở hữu của `userId` được truyền lên, service sẽ ném `NotFoundException` (trả về lỗi HTTP 404).
3. **Implementation trong Controller:**
   - Nhận `userId` qua query param hoặc Auth Token Decorator và truyền xuống Service.
   - Thêm decorator `@ApiQuery({ name: 'userId', required: false })` trong Swagger documentation.

