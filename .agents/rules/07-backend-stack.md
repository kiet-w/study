# Rule 07 — Backend Tech Stack (NestJS + Prisma ORM + Supabase)

> Đọc khi: phát triển NestJS API backend (`backend/`), setup Prisma ORM, Supabase DB, hoặc AI service (Phase 4+).  
> Nguồn sự thật chi tiết: `docs/02-backend-supabase/`

---

## Phần 0: NestJS Backend Architecture (`backend/`)

### Architecture Overview
Backend được xây dựng bằng **NestJS** (TypeScript) kết hợp **Prisma ORM** tương tác với Supabase PostgreSQL database.

```
backend/
├── src/
│   ├── main.ts              # Entrypoint app, ValidationPipe, Swagger setup
│   ├── app.module.ts        # Root AppModule
│   ├── shared/              # Shared module (PrismaModule, PrismaService)
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   └── modules/             # Feature modules
│       └── users/           # UsersModule, UsersController, UsersService, DTOs
├── prisma/
│   └── schema.prisma        # Database schema definitions
├── nest-cli.json            # Nest CLI config
├── tsconfig.json            # TypeScript compiler config với decorators
└── package.json             # NestJS & Prisma dependencies
```

### Core Patterns & Standard Principles
1. **Dependency Injection & Modular Structure**: Tất cả các module phải được đóng gói độc lập trong `src/modules/` và import `PrismaModule` từ `shared/prisma/`.
2. **DTO & Validation**: Dùng `class-validator` và `class-transformer` trên DTOs, kích hoạt `ValidationPipe` toàn cục trong `main.ts` (`whitelist: true, transform: true`).
3. **API Documentation**: Sử dụng `@nestjs/swagger` để tự động tạo tài liệu API tại route `/api/docs`.
4. **Environment Configuration**: Dùng `@nestjs/config` để quản lý biến môi trường (`.env`).


## Phần 1: Supabase (Phase 0–3)

### Setup Project (từ `docs/02-backend-supabase/setup-steps.md`)

```bash
# 1. Tạo project MỚI RIÊNG trên supabase.com (không dùng chung webapp)
# 2. Vào SQL Editor, chạy schema Phase 1 từ docs/02-backend-supabase/database-schema.md
# 3. Tạo 2 buckets: photos, thumbnails (để PRIVATE)
# 4. Áp RLS policies (xem docs/02-backend-supabase/storage-and-auth.md)
# 5. Bật Email + Google provider trong Authentication → Providers
# 6. Copy URL + anon key vào .env

# CLI (local dev)
npm install -g supabase
supabase init
supabase start          # Cần Docker
supabase db reset       # Apply migrations
supabase db push        # Push lên production
```

### Schema Phase 1 (chạy trước, phần còn lại theo phase)

```sql
-- subjects
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  icon text,
  created_at timestamptz default now()
);

-- photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete set null,
  storage_path text not null,
  thumbnail_path text,
  taken_at timestamptz not null,
  note text,
  sync_status text default 'pending',  -- 'pending' | 'synced'
  created_at timestamptz default now()
);

create index idx_photos_user_subject on photos(user_id, subject_id);
create index idx_photos_taken_at on photos(taken_at desc);

-- RLS
alter table subjects enable row level security;
alter table photos enable row level security;

create policy "Users can CRUD own subjects"
  on subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own photos"
  on photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Schema thêm theo phase** — xem đầy đủ trong `docs/02-backend-supabase/database-schema.md`:
- Phase 2: `folders` table, thêm `folder_id` vào `photos`
- Phase 3: `groups`, `group_members`, `photo_comments` + RLS mới cho group
- Phase 4: thêm `ocr_text`, `ai_summary`, `ai_status` vào `photos`
- Phase 5: `class_sessions` table

### Storage Buckets (PRIVATE — không public)

```sql
-- Tạo trong Supabase Dashboard (Storage section)
-- Bucket: photos    → Private
-- Bucket: thumbnails → Private

-- Storage RLS — user chỉ access đường dẫn bắt đầu bằng user_id của mình
create policy "User owns their photos"
  on storage.objects for all to authenticated
  using (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Tương tự cho bucket thumbnails
```

### Auth Config (Supabase Dashboard)

```
Authentication → Providers:
  ✓ Email (Magic Link hoặc password)
  ✓ Google

Authentication → URL Configuration:
  Site URL: exp://localhost:8081 (dev)
  Redirect URLs: studysnap://auth-callback
```

Session lưu bằng `expo-secure-store` — **không** dùng AsyncStorage thường cho token.

---

## Phần 2: AI Service — NestJS (Phase 4 ONLY)

> ⚠️ KHÔNG setup trước Phase 4. Đọc `.agents/rules/05-phase-gates.md`.

### Stack AI Service

```
Runtime:    Node.js 20 LTS
Framework:  NestJS 10
Queue:      BullMQ 5 + Redis 7
AI:         Google Gemini API (@google/generative-ai)
Stream:     Server-Sent Events (SSE)
```

### Pipeline (tái dụng pattern note-taking app)

```
[App] → upload ảnh → Supabase Storage (photos.ai_status = 'queued')
                          ↓
               [Supabase DB Webhook / polling]
                          ↓
             [NestJS] → BullMQ job
                          ↓
             [Worker] → download ảnh → Gemini Vision API
                          ↓
             → ghi ocr_text, ai_summary, ai_status='done' vào photos
                          ↓
             → SSE stream tiến độ về App
```

### Gemini Prompt (3-layer pattern)

```ts
const prompt = `
Phân tích ảnh bài giảng/ghi chú học tập:
1. OCR toàn bộ text
2. Gợi ý môn học (Toán/Lý/Hóa/Văn/Sử/Địa/Anh/Tin/khác)
3. Tóm tắt nội dung (1-2 câu)

Trả về JSON: { "ocr_text": "...", "subject": "...", "summary": "..." }
`
```

### Monorepo khi tới Phase 4

```
study/
├── app/                 ← Expo Router (React Native)
├── src/                 ← RN source
├── supabase/            ← Migrations
├── ai-service/          ← NestJS service (Phase 4, package.json riêng)
└── ...
```

> 2 `package.json` riêng biệt — không dùng npm workspaces để tránh conflict.
