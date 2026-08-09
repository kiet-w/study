# AGENTS.md — StudySnap Android App

> **AI coding agent: Đọc file này TRƯỚC KHI làm bất cứ thứ gì.**
> Nó cho bạn biết project là gì, file nào được đụng, và rule nào phải theo.

---

## Quick Lookup

| Tình huống | Đọc file nào |
|:-----------|:------------|
| Setup Expo / thêm package | `.agents/rules/06-frontend-stack.md` |
| Setup Supabase / viết migration | `.agents/rules/07-backend-stack.md` |
| Viết component / hook / file mới | `.agents/rules/02-code-style.md` |
| Thao tác với Supabase query / RLS | `.agents/rules/03-supabase-rules.md` |
| Implement camera hoặc upload | `.agents/flows/camera-capture.md` hoặc `.agents/flows/photo-upload.md` |
| Implement auth | `.agents/flows/auth-flow.md` |
| Không chắc feature thuộc phase nào | `.agents/rules/05-phase-gates.md` |
| Lỗi bất kỳ liên quan data / auth | `.agents/rules/01-critical-files.md` |

---

## 1. Project Snapshot

**StudySnap** = Android app giúp học sinh/sinh viên chụp ảnh bài giảng và phân loại theo môn học.  
**Problem:** Ảnh bài giảng lẫn lộn với ảnh cá nhân trong album điện thoại, khó xem lại và chia sẻ.  
**Current phase:** Phase 1 — MVP: chụp + phân loại + sync.

```
Stack:
  Mobile   → React Native + Expo 52 (TypeScript, Expo Router)
  Backend  → Supabase (Auth + PostgreSQL + Storage + Realtime)
  Styling  → NativeWind (Tailwind syntax trên React Native)
  State    → Zustand (persist qua AsyncStorage)
  AI (sau) → NestJS + BullMQ + Redis + Gemini Vision API (Phase 4)
```

**Docs đầy đủ:** `docs/` — đây là nguồn sự thật, đọc trước khi code bất cứ feature nào.

---

## 2. Cấu Trúc Thư Mục Thực Tế

```
study/
├── AGENTS.md                    ← Bạn đang đọc
├── README.md                    ← Tổng quan + roadmap
│
├── docs/                        ← NGUỒN SỰ THẬT — đọc trước khi code
│   ├── 00-overview/
│   │   └── vision-and-roadmap.md        ← Vision, roadmap, nguyên tắc thiết kế
│   ├── 01-mobile-app/
│   │   ├── tech-stack.md                ← Packages, lý do chọn, không dùng gì
│   │   ├── folder-structure.md          ← FSD structure: shared/entities/features/widgets
│   │   ├── phase-1-capture-categorize.md ← Scope MVP: capture + sync + library
│   │   └── phase-2-albums-export.md     ← Scope phase 2 (chưa làm)
│   ├── 02-backend-supabase/
│   │   ├── database-schema.md           ← SQL schema từng phase (NGUỒN SỰ THẬT)
│   │   ├── setup-steps.md               ← Các bước setup Supabase project
│   │   └── storage-and-auth.md          ← Buckets, RLS, Auth providers
│   ├── 04-group-chat-future/
│   │   └── architecture.md              ← Phase 3: Supabase Realtime + nhóm chat
│   └── 05-calendar-future/
│       └── architecture.md              ← Phase 5: class_sessions + gợi ý môn
│
├── .agents/                     ← Rules và flows cho AI coding agent
│   ├── rules/
│   │   ├── 01-critical-files.md
│   │   ├── 02-code-style.md
│   │   ├── 03-supabase-rules.md
│   │   ├── 04-offline-first.md
│   │   ├── 05-phase-gates.md
│   │   ├── 06-frontend-stack.md
│   │   └── 07-backend-stack.md
│   └── flows/
│       ├── camera-capture.md
│       ├── photo-upload.md
│       └── auth-flow.md
│
├── frontend/                    ← React Native / Expo Frontend App
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── components/          # UI Components
│       ├── hooks/               # Custom hooks
│       ├── lib/                 # supabase.ts 🔴, subjectService, formatters
│       └── types/               # Frontend interfaces
│
├── backend/                     # Express TypeScript Backend Server
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/                  # Prisma ORM schema
│   │   └── schema.prisma
│   └── src/
│       ├── app.ts               # Express configuration
│       ├── index.ts             # Server entrypoint
│       ├── config/              # Environment config
│       ├── controllers/         # User Controller (createUser, getUsers)
│       ├── middleware/          # validate & errorHandler
│       ├── routes/              # Express routes (/api/users)
│       ├── services/            # User Service business logic
│       └── types/               # User DTOs

│   │   ├── capture-photo/       ← Logic chụp + gắn môn
│   │   ├── manage-subjects/     ← CRUD môn học
│   │   └── sync-photos/         ← Upload nền, retry khi mất mạng
│   │
│   ├── widgets/                 ← Ghép features thành khối UI lớn
│   │   ├── photo-grid/          ← Lưới ảnh + filter
│   │   └── capture-flow/        ← Camera + chip chọn môn
│   │
│   ├── screens/                 ← Nội dung thật của screen, import widgets
│   │   ├── CaptureScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   └── SubjectsScreen.tsx
│   │
│   ├── store/                   ← Zustand stores (persist)
│   │   ├── useAuthStore.ts      ← 🔴 CRITICAL
│   │   └── usePhotoStore.ts     ← 🔴 CRITICAL
│   │
│   └── types/
│       └── index.ts             ← Subject, Photo, Folder interfaces
│
├── supabase/
│   └── migrations/              ← SQL files — không sửa trực tiếp DB mà không có đây
│
└── assets/                      ← Fonts, images, icons
```

---

## 3. Types Hiện Có (`src/types/index.ts`)

```ts
Subject    { id, user_id, name, color, icon, created_at }
Photo      { id, user_id, subject_id, storage_path, thumbnail_path,
             note, taken_at, sort_order, synced, created_at }
// Phase 2+: thêm folder_id vào Photo
// Folder, Group, PhotoComment — xem docs/02-backend-supabase/database-schema.md
```

---

## 4. Files Tuyệt Đối KHÔNG Được Sửa

| File | Hậu quả nếu sai |
|:-----|:----------------|
| `src/shared/lib/supabase.ts` | Mất auth toàn app |
| `src/store/useAuthStore.ts` | Loop logout, mất session |
| `src/store/usePhotoStore.ts` | Mất queue ảnh chưa sync |
| `app/_layout.tsx` | Routing vỡ, auth guard mất |
| `supabase/migrations/*.sql` | Nguy cơ mất data production |
| `.env` | API keys — không log, không hardcode |

→ Chi tiết: `.agents/rules/01-critical-files.md`

---

## 5. Nguyên Tắc Import (FSD — Feature-Sliced Design)

```
app/ → screens/ → widgets/ → features/ → entities/ → shared/
```

- **Chiều phụ thuộc chỉ đi xuống** — không được import ngược lên
- `features/` không được import lẫn nhau
- `app/` chỉ import từ `screens/`, không viết logic trực tiếp

---

## 6. Phases

```
Phase 1: MVP      ← ĐANG LÀM
  ✓ capture-photo: chụp + chọn môn + lưu local
  ✓ manage-subjects: CRUD môn học  
  ✓ sync-photos: upload nền khi có mạng
  ✓ photo-grid: thư viện + filter theo môn/ngày
  ✓ auth: email + Google

Phase 2: UX       ← Chưa làm (docs/01-mobile-app/phase-2-albums-export.md)
  - folders/chương, drag-drop, export PDF, nén ảnh

Phase 3: Social   ← Chưa làm (docs/04-group-chat-future/architecture.md)
  - Nhóm học, chia sẻ ảnh, tag, Supabase Realtime

Phase 4: AI       ← Chưa làm
  - NestJS + BullMQ + Gemini Vision: OCR, tóm tắt, flashcard

Phase 5: Calendar ← Chưa làm (docs/05-calendar-future/architecture.md)
  - class_sessions, gợi ý môn theo giờ học
```

→ Chi tiết: `.agents/rules/05-phase-gates.md`

---

## 7. Core Decisions (Đã Chốt)

| Quyết định | Lý do |
|:-----------|:------|
| **React Native + Expo** (không Kotlin) | Tận dụng React đã biết |
| **NativeWind** (Tailwind syntax) | Giữ quen tay với webapp |
| **FSD folder structure** | Nhất quán với webapp hiện tại |
| **Supabase project riêng** | Không lẫn data với webapp |
| **Chọn môn TRƯỚC khi chụp** | Tối thiểu thao tác lúc đang nghe giảng (≤ 2 chạm) |
| **Offline-first** | Wifi/4G VN không ổn định trong lớp học |
| **2 buckets riêng** (`photos` + `thumbnails`) | Quản lý size và signed URL độc lập |
| **MVP nhanh → dùng thử → mở rộng** | YAGNI |
