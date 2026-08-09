# AGENTS.md — StudySnap Android & Backend Monorepo

> **AI coding agent: Đọc file này TRƯỚC KHI làm bất cứ thứ gì.**
> File này định nghĩa toàn bộ quy chuẩn dự án, cấu trúc thư mục Frontend/Backend, các file critical không được sửa tự do, và chỉ dẫn các rule cần tuân thủ.

---

## Quick Lookup Index

| Tình huống | Đọc file nào |
|:-----------|:------------|
| Setup / phát triển **NestJS API Backend** | `.agents/rules/07-backend-stack.md` |
| Setup / phát triển **React Native + Expo App** | `.agents/rules/06-frontend-stack.md` |
| Viết component / controller / service / file mới | `.agents/rules/02-code-style.md` |
| Thao tác với Supabase query, RLS, Storage | `.agents/rules/03-supabase-rules.md` |
| Logic offline-first, queue & sync ảnh | `.agents/rules/04-offline-first.md` |
| Implement camera hoặc upload flow | `.agents/flows/camera-capture.md` hoặc `.agents/flows/photo-upload.md` |
| Implement auth (Email / Google / Supabase) | `.agents/flows/auth-flow.md` |
| Kiểm tra scope từng Phase dự án | `.agents/rules/05-phase-gates.md` |
| Xử lý lỗi liên quan file quan trọng (Critical) | `.agents/rules/01-critical-files.md` |

---

## 1. Project Snapshot

**StudySnap** = Ứng dụng Android giúp học sinh/sinh viên chụp ảnh bài giảng, tự động phân loại theo môn học (Categories) và chương (Topics), đi kèm hệ thống REST API Backend NestJS.  
**Problem:** Ảnh bài giảng lẫn lộn với ảnh cá nhân trong album điện thoại, khó xem lại và chia sẻ.  
**Current Phase:** Phase 1 — MVP: Chụp + Chọn môn + Local Storage + NestJS Backend REST API & Supabase Sync.

```
Tech Stack Overview:
  Mobile App   → React Native + Expo 52 (TypeScript, Expo Router)
  Backend API  → NestJS 10 (TypeScript, Prisma ORM, Swagger, ValidationPipe)
  Database     → Supabase PostgreSQL (Prisma ORM integration)
  Styling      → NativeWind (Tailwind syntax trên React Native)
  State Management → Zustand (persist qua AsyncStorage)
  AI (Phase 4) → NestJS + BullMQ + Redis + Gemini Vision API
```

**Docs đầy đủ:** `docs/` — nguồn sự thật về kiến trúc và roadmap.

---

## 2. Cấu Trúc Thư Mục Dự Án Thực Tế (Workspace Layout)

```
study/
├── AGENTS.md                         ← File hướng dẫn AI Agent này
├── README.md                         ← Master documentation dự án
├── .gitignore                        ← Cấu hình gitignore cho monorepo
│
├── docs/                             ← Tài liệu kỹ thuật chi tiết
│   ├── 00-overview/vision-and-roadmap.md
│   ├── 01-mobile-app/
│   │   ├── tech-stack.md
│   │   ├── folder-structure.md       ← FSD structure: shared/entities/features/widgets
│   │   ├── phase-1-capture-categorize.md
│   │   └── phase-2-albums-export.md
│   └── 02-backend-supabase/
│       ├── database-schema.md
│       ├── setup-steps.md
│       └── storage-and-auth.md
│
├── .agents/                          ← Rules và flows hướng dẫn AI Coding Agent
│   ├── rules/
│   │   ├── 01-critical-files.md      ← Danh sách file bảo vệ
│   │   ├── 02-code-style.md          ← Quy chuẩn code TypeScript, RN, NestJS
│   │   ├── 03-supabase-rules.md      ← RLS, Auth, Client queries
│   │   ├── 04-offline-first.md      ← Queue sync ảnh local
│   │   ├── 05-phase-gates.md         ← Phân chia tính năng từng phase
│   │   ├── 06-frontend-stack.md      ← Expo, NativeWind, FSD
│   │   └── 07-backend-stack.md       ← NestJS, Prisma ORM, Swagger, Interceptors
│   └── flows/
│       ├── camera-capture.md
│       ├── photo-upload.md
│       ├── auth-flow.md
│       └── create-subject.md
│
├── frontend/                         ← React Native / Expo Mobile App
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md                     ← Hướng dẫn chạy Frontend
│   └── src/
│       ├── components/               # Reusable UI Components (Modal, Button, Input,...)
│       ├── hooks/                    # Custom React Hooks (useSubjects,...)
│       ├── lib/                      # Supabase client singleton 🔴, subjectService, constants
│       └── types/                    # Interfaces (Subject, Photo, CreateSubjectInput,...)
│
├── backend/                          ← NestJS REST API Backend Server
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── README.md                     # Hướng dẫn chạy Backend & Swagger docs
│   ├── prisma/
│   │   └── schema.prisma             # Prisma ORM schema (Category, Topic, Photo) 🔴
│   └── src/
│       ├── main.ts                   # NestJS entrypoint (ValidationPipe, Swagger, CORS) 🔴
│       ├── app.module.ts             # Root Module 🔴
│       ├── shared/
│       │   ├── prisma/               # Global PrismaModule & PrismaService 🔴
│       │   ├── filters/              # Global HttpExceptionFilter
│       │   └── interceptors/         # Global TransformInterceptor
│       └── modules/                  # Feature Modules (Controllers, Services, DTOs)
│           ├── categories/           # CategoriesModule (CRUD môn học)
│           ├── topics/               # TopicsModule (CRUD chương/chủ đề)
│           ├── photos/               # PhotosModule (Quản lý ảnh & sync status)
│           ├── users/                # UsersModule (User profile management)
│           └── health/               # HealthModule (GET /api/health)
│
└── supabase/
    └── migrations/                   # SQL migration scripts
```

---

## 3. Types & Schema Mẫu

### Prisma Schema (`backend/prisma/schema.prisma`)
- `Category` (môn học): `{ id, userId, name, color, icon, sortOrder, createdAt }`
- `Topic` (chương): `{ id, userId, categoryId, name, color, icon, sortOrder, createdAt }`
- `Photo` (ảnh bài giảng): `{ id, userId, categoryId, topicId, storagePath, thumbnailPath, note, takenAt, sortOrder, synced, createdAt }`

### Frontend Types (`frontend/src/types/index.ts`)
- `Category` (môn học): `{ id, user_id, name, color, icon, sort_order, created_at }`
- `Topic` (chương/chủ đề): `{ id, user_id, category_id, name, color, icon, sort_order, created_at }`
- `Photo` (ảnh bài giảng): `{ id, user_id, category_id, topic_id, storage_path, thumbnail_path, note, taken_at, sort_order, synced, created_at }`

---

## 4. Files Tuyệt Đối KHÔNG Được Sửa Trực Tiếp (Critical Protection)

| File | Lý do bảo vệ / Hậu quả nếu sai |
|:-----|:-------------------------------|
| `frontend/src/lib/supabase.ts` | 🔴 Mất khởi tạo Auth & Supabase singleton client toàn app |
| `backend/src/main.ts` | 🔴 Hỏng cấu hình NestFactory, Swagger, Global Pipes & CORS |
| `backend/src/app.module.ts` | 🔴 Hỏng luồng import Root Module của NestJS |
| `backend/src/shared/prisma/prisma.service.ts` | 🔴 Hỏng kết nối Database của Prisma ORM toàn backend |
| `backend/prisma/schema.prisma` | 🔴 Nguy cơ lệch DB Schema với Supabase PostgreSQL |
| `supabase/migrations/*.sql` | 🔴 Risk mất dữ liệu Production |
| `.env` | 🔴 Chứa Secrets/API Keys — không log, không push token |

→ Xem chi tiết tại: `.agents/rules/01-critical-files.md`

---

## 5. Nguyên Tắc Import & Kiến Trúc Code

### Backend (NestJS Architecture)
- Luồng phụ thuộc: `Route → Controller → Service → PrismaService (Database)`
- Tất cả DTOs bắt buộc dùng `class-validator` và `@nestjs/swagger` decorators.
- Service nhận và trả về dữ liệu qua DTO / Prisma Models, không xử lý trực tiếp HTTP Request/Response objects (`req`, `res`).

### Frontend (Feature-Sliced Design)
- Luồng phụ thuộc: `app/ → screens/ → widgets/ → features/ → entities/ → shared/`
- `features/` tuyệt đối không import lẫn nhau.

---

## 6. Lộ Trình Phát Triển (Phase Gates Summary)

- **Phase 1 (MVP — ĐANG LÀM):** React Native Mobile App + NestJS REST API + Supabase PostgreSQL (Categories, Photos, Sync, Auth).
- **Phase 2 (UX):** Topics/Folders, Kéo thả sắp xếp, Export PDF.
- **Phase 3 (Social):** Nhóm học tập, Chia sẻ ảnh, Supabase Realtime Chat.
- **Phase 4 (AI):** NestJS + BullMQ + Redis + Gemini Vision API (OCR bảng, tóm tắt bài giảng).
- **Phase 5 (Calendar):** Lịch học `class_sessions`, tự động gợi ý môn học khi chụp trong giờ.

→ Chi tiết: `.agents/rules/05-phase-gates.md`
