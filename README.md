# 📚 StudySnap — Chụp & Sắp Xếp Kiến Thức Bài Giảng

> App Android giúp học sinh/sinh viên chụp ảnh bài giảng, tự động phân loại theo môn học, không lẫn lộn với ảnh cá nhân trong album điện thoại.

[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Vấn đề

Học sinh chụp slide, bảng viết, đề thi, bài giải bằng điện thoại mỗi ngày. Ảnh lẫn lộn với selfie, meme, đồ ăn trong album. Đến lúc ôn thi → không tìm lại được. Chia sẻ cho bạn bè → phải lục từng ảnh. Vật lý lẫn với Hóa học → không theo dõi được.

## Giải pháp

App riêng biệt chỉ dành cho ảnh bài giảng. Chọn môn trước → chụp → ảnh tự vào đúng chỗ. Không cần sắp xếp thủ công.

---

## Tech Stack

| Layer | Công nghệ | Lý do |
|:------|:----------|:------|
| **Mobile App** | **React Native + Expo** | Tận dụng kinh nghiệm React/Next.js đã có, learning curve gần bằng 0. Expo cho camera, file system, EAS Build APK |
| **Backend & Auth** | **Supabase** (PostgreSQL, Auth, Storage, Realtime) | Đã quen dùng. RLS bảo mật dữ liệu cá nhân. Auth Google/Email sẵn. Realtime cho nhóm chat sau này |
| **AI (giai đoạn sau)** | **NestJS + BullMQ + Redis + Gemini Vision API** | Tái sử dụng pipeline đã build cho app note-taking: ảnh → queue → Gemini OCR → SSE trả kết quả |

---

## Kiến trúc

```
┌─────────────────────┐
│  React Native App   │
│  (Expo + Camera)    │
└────────┬────────────┘
         │ upload ảnh / sync
         ▼
┌─────────────────────┐     ┌──────────────────────┐
│     Supabase        │     │  AI Service (sau)    │
│  - Auth             │────▶│  NestJS + BullMQ     │
│  - PostgreSQL       │◀────│  + Gemini Vision     │
│  - Storage (ảnh)    │     │  + SSE realtime      │
│  - Realtime (chat)  │     └──────────────────────┘
└─────────────────────┘
```

---

## Database Schema

```sql
-- Môn học
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,        -- "Vật lý đại cương", "Giải tích 1"
  color TEXT,                -- hex color để nhận diện nhanh
  icon TEXT,                 -- emoji hoặc icon name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chương / buổi học trong 1 môn
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,        -- "Chương 3: Điện học"
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ảnh chụp bài giảng
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,    -- path trong Supabase Storage
  thumbnail_path TEXT,           -- ảnh nén preview
  note TEXT,                     -- ghi chú thêm
  taken_at TIMESTAMPTZ NOT NULL, -- thời điểm chụp
  sort_order INT DEFAULT 0,      -- thứ tự trong folder (kéo thả)
  synced BOOLEAN DEFAULT FALSE,  -- đã upload lên cloud chưa
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: mỗi user chỉ thấy data của mình
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Bảng mở rộng sau này (giai đoạn 3+)
-- groups (id, name, invite_code, created_by)
-- group_members (group_id, user_id, role)
-- group_photos (group_id, photo_id, shared_by)
-- photo_tags (photo_id, tagged_user_id)
-- photo_comments (photo_id, user_id, content)
```

---

## Lộ trình phát triển

### Giai đoạn 0 — Setup (~1 tuần)
- [ ] Tạo Expo project + Supabase project mới (tách riêng khỏi webapp)
- [ ] Setup EAS Build → build APK test trên điện thoại thật (camera không test được trên emulator)
- [ ] Wireframe 3 màn chính: Chụp ảnh → Chọn môn → Thư viện xem lại
- [ ] Tạo database schema + RLS policies

### Giai đoạn 1 — MVP: Chụp & Phân Loại (2-3 tuần) ⭐ Ưu tiên #1
- [ ] **Camera capture** (`expo-camera`): chọn môn (chip màu) → chụp → ảnh tự lưu vào đúng môn
- [ ] **Quản lý môn học**: CRUD, mỗi môn có màu + icon riêng
- [ ] **Offline-first**: cache ảnh local trước, upload nền lên Supabase Storage (wifi/4G VN không ổn định)
- [ ] **Thư viện xem lại**: lưới ảnh, lọc theo môn/ngày
- [ ] **Auth**: Email hoặc Google login

### Giai đoạn 2 — Hoàn thiện trải nghiệm
- [ ] Folder/chương trong từng môn (VD: Vật lý → Chương 3: Điện học)
- [ ] Kéo thả sắp xếp thứ tự ảnh
- [ ] Export môn/chương thành PDF (ôn thi)
- [ ] Nén ảnh trước khi upload

### Giai đoạn 3 — Nhóm chat & chia sẻ
- [ ] Tạo nhóm học bằng mã mời
- [ ] Chia sẻ ảnh vào nhóm, tag bạn bè, bình luận
- [ ] Supabase Realtime (không cần tự dựng WebSocket)

### Giai đoạn 4 — AI phân tích ảnh
- [ ] Tái sử dụng pipeline note-taking: ảnh → BullMQ → Gemini Vision → SSE
- [ ] OCR bảng viết thành text tìm kiếm được
- [ ] Tóm tắt tự động, tạo flashcard/quiz từ ảnh

### Giai đoạn 5 — Lịch học
- [ ] Thời khóa biểu → app tự gợi ý đúng môn khi chụp trong giờ tiết đó
- [ ] Đồng bộ Google Calendar hoặc tự tạo TKB

---

## Cài đặt local

```bash
git clone https://github.com/kiet-w/study.git
cd study

# Cài dependencies
npm install

# Chạy trên Expo Go (dev)
npx expo start

# Build APK test
eas build -p android --profile preview
```

### Biến môi trường (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Quyết định thiết kế đã chốt

| Câu hỏi | Quyết định |
|:---------|:-----------|
| React Native/Expo hay Kotlin native? | **React Native + Expo** — tận dụng React đã biết, sau này ra iOS miễn phí |
| Chung hay tách Supabase project? | **Tách riêng** — không lẫn dữ liệu với webapp |
| Flow chụp: chọn môn trước hay sau? | **Chọn môn trước** — nhanh hơn lúc đang nghe giảng, giảm thao tác |
| MVP nhanh hay kiến trúc kỹ? | **MVP nhanh** — tự dùng thử trước, mở rộng sau |

---

## License

[MIT](LICENSE)
