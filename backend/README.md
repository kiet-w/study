# ⚙️ StudySnap API Server (Backend - NestJS)

REST API Server cho hệ thống StudySnap được xây dựng bằng **NestJS** kết hợp **Prisma ORM** và **Supabase PostgreSQL**.

## Tech Stack
- **Framework:** NestJS 10 (TypeScript)
- **Database ORM:** Prisma ORM 5
- **Database Provider:** Supabase PostgreSQL
- **Validation & Transformation:** `class-validator` & `class-transformer`
- **API Documentation:** Swagger / OpenAPI (`@nestjs/swagger`)

## Cấu trúc dự án (`src/`)

```
backend/
├── src/
│   ├── main.ts                       # Entrypoint app (ValidationPipe, Swagger, CORS, Port)
│   ├── app.module.ts                 # Root AppModule
│   ├── modules/                      # Feature modules độc lập
│   │   ├── categories/               # API danh mục/môn học (Controller, Service, DTOs)
│   │   ├── topics/                   # API chủ đề/chương (Controller, Service, DTOs)
│   │   ├── photos/                   # API quản lý ảnh bài giảng (Controller, Service, DTOs)
│   │   ├── users/                    # API người dùng & profile (Controller, Service, DTOs)
│   │   └── health/                   # Endpoint health check (GET /api/health)
│   └── shared/                       # Shared Modules, Interceptors, Filters
│       ├── prisma/                   # PrismaModule & PrismaService
│       ├── filters/                  # HttpExceptionFilter toàn cục
│       └── interceptors/             # TransformInterceptor toàn cục
└── prisma/
    └── schema.prisma                 # Định nghĩa Schema Database PostgreSQL
```

## Hướng dẫn cài đặt & chạy ứng dụng

```bash
# 1. Cài đặt dependencies
npm install

# 2. Sinh mã Prisma Client từ schema
npx prisma generate

# 3. Đẩy schema lên Supabase DB (Development)
npx prisma db push

# 4. Chạy server ở chế độ Development (Hot reload)
npm run dev

# 5. Build mã nguồn Production
npm run build

# 6. Chạy server Production
npm start
```

## Swagger API Documentation

Khi server đang chạy ở môi trường Dev, truy cập tài liệu API trực quan tại:
👉 **`http://localhost:3000/api/docs`**
