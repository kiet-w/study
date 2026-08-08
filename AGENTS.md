# AGENTS.md — StudySnap Android App

> **AI coding agent: Đọc file này TRƯỚC KHI làm bất cứ thứ gì.**
> Nó cho bạn biết project này là gì, file nào được đụng, flow code nào phải theo.

---

## 1. Project Snapshot (đọc trong 30 giây)

**StudySnap** = Android app cho học sinh/sinh viên chụp ảnh bài giảng, phân loại theo môn học.  
**Problem solved:** Ảnh bài giảng không còn lẫn lộn trong album điện thoại.  
**Current stage:** Phase 0 — chưa có code, đang setup cấu trúc.

```
Stack:
  App      → React Native + Expo (TypeScript)
  Backend  → Supabase (Auth + PostgreSQL + Storage + Realtime)
  AI (sau) → NestJS + BullMQ + Redis + Gemini Vision API (Phase 4)
```

**Đọc thêm:** `README.md` (toàn bộ roadmap + schema)

---

## 2. Cấu Trúc Thư Mục

```
study/
├── AGENTS.md               ← Bạn đang đọc file này
├── README.md               ← Project overview & roadmap
├── .agents/                ← Rules & flow cho AI agents
│   ├── rules/
│   │   ├── 01-critical-files.md    ← Files KHÔNG được sửa tùy tiện
│   │   ├── 02-code-style.md        ← TypeScript + React Native conventions
│   │   ├── 03-supabase-rules.md    ← RLS, schema, query patterns
│   │   ├── 04-offline-first.md     ← Offline-first là BẮT BUỘC
│   │   └── 05-phase-gates.md       ← Không code Phase N+1 khi Phase N chưa xong
│   └── flows/
│       ├── camera-capture.md       ← Flow chụp ảnh chuẩn
│       ├── photo-upload.md         ← Flow offline cache → background sync
│       └── auth-flow.md            ← Auth flow với Supabase
├── app/                    ← Expo Router (file-based routing)
│   ├── (auth)/             ← Auth screens
│   ├── (tabs)/             ← Main tab navigator
│   └── _layout.tsx
├── src/
│   ├── components/         ← UI components
│   ├── hooks/              ← Custom hooks
│   ├── lib/                ← Core utilities (supabase client, etc.)
│   ├── store/              ← Zustand state management
│   └── types/              ← TypeScript types/interfaces
├── supabase/
│   └── migrations/         ← SQL migration files
└── assets/
```

---

## 3. Files Tuyệt Đối KHÔNG Được Sửa (Trừ Khi User Yêu Cầu Rõ Ràng)

| File/Folder | Lý do bảo vệ |
|:-----------|:-------------|
| `src/lib/supabase.ts` | Supabase client config — sai là mất auth toàn app |
| `src/store/useAuthStore.ts` | Auth state — sai là logout vô cớ, loop auth |
| `src/store/usePhotoStore.ts` | Photo queue state — sai là mất ảnh chưa sync |
| `supabase/migrations/*.sql` | Database schema — sai là mất data production |
| `app/_layout.tsx` | Root layout + auth guard — sai là routing vỡ |
| `.env` / `.env.local` | API keys — không được hardcode, không được log |

**Chi tiết:** `.agents/rules/01-critical-files.md`

---

## 4. Phases — Làm Theo Thứ Tự, Không Nhảy Cóc

```
Phase 0: Setup     → Expo project, Supabase, EAS Build, DB schema
Phase 1: MVP       → Camera capture + subject management + photo library ← HIỆN TẠI
Phase 2: UX        → Folders/chapters, drag-drop, PDF export, compression
Phase 3: Social    → Groups, sharing, tagging, Realtime chat
Phase 4: AI        → BullMQ + Gemini Vision OCR + flashcards
Phase 5: Schedule  → Timetable + smart subject suggestion
```

> **Nguyên tắc:** Không implement bất kỳ feature nào của Phase N+1 khi Phase N chưa có test/demo chạy được.

**Chi tiết:** `.agents/rules/05-phase-gates.md`

---

## 5. Core Decisions (Đã Chốt, Không Tranh Luận Lại)

| Câu hỏi | Quyết định | Lý do |
|:--------|:-----------|:------|
| Framework mobile | **React Native + Expo** | User đã quen React, expo-camera đầy đủ |
| Kotlin native? | **Không** | Tốn thời gian học stack mới trước khi code logic |
| Supabase project | **Tách riêng** khỏi webapp | Không lẫn data |
| Flow chụp | **Chọn môn TRƯỚC** khi bấm chụp | Nhanh hơn lúc đang nghe giảng |
| Upload strategy | **Offline-first**: cache local → sync nền | Wifi/4G VN không ổn định |
| State management | **Zustand** | Simple, không boilerplate như Redux |
| MVP priority | **Nhanh → tự dùng thử → mở rộng** | YAGNI |

---

## 6. Khi Gặp Vấn Đề

```
Lỗi Supabase/Auth/Data → DỪNG, đọc .agents/rules/01-critical-files.md
Lỗi offline sync      → DỪNG, đọc .agents/flows/photo-upload.md
Câu hỏi về schema     → đọc supabase/migrations/ trước khi sửa
Không chắc Phase nào  → đọc .agents/rules/05-phase-gates.md
```

**Không được** refactor cấu trúc thư mục mà không hỏi user trước.
