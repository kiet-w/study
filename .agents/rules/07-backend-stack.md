# Rule 07 — Backend Tech Stack (Supabase + AI Service)

> Đọc file này khi: setup Supabase project, viết migration, hoặc setup AI service (Phase 4+).

---

## Phần 1: Supabase (Phase 0–3, Backend chính)

### Setup Project

```bash
# Cài Supabase CLI
npm install -g supabase

# Login
supabase login

# Init local (chạy 1 lần trong root project)
supabase init

# Khởi chạy local Supabase (Docker required)
supabase start

# Apply migrations lên local
supabase db reset

# Push lên production
supabase db push
```

### Supabase Services Dùng Trong Project

| Service | Dùng từ Phase | Mục đích |
|:--------|:-------------|:---------|
| **Auth** | Phase 0 | Google OAuth + Email Magic Link |
| **PostgreSQL** | Phase 0 | Lưu subjects, folders, photos metadata |
| **Storage** | Phase 1 | Lưu file ảnh + thumbnail |
| **Realtime** | Phase 3 | Group chat, chia sẻ ảnh realtime |
| **Edge Functions** | Phase 4 (nếu cần) | Lightweight API thay NestJS |

### Storage Buckets

```sql
-- Tạo bucket (chạy 1 lần trong Supabase dashboard hoặc migration)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);  -- public để get URL không cần auth

-- Storage RLS Policy
CREATE POLICY "Users upload own photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Database Schema & Migrations

File migration đặt trong `supabase/migrations/`, tên format: `YYYYMMDDHHMMSS_description.sql`

```sql
-- supabase/migrations/20260809000001_initial_schema.sql

-- Môn học
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',  -- hex color
  icon TEXT NOT NULL DEFAULT '📚',        -- emoji
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chương / Folder trong môn
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ảnh bài giảng
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  note TEXT,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subjects_user ON subjects(user_id);
CREATE INDEX idx_folders_subject ON folders(subject_id);
CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_photos_subject ON photos(subject_id);
CREATE INDEX idx_photos_taken ON photos(taken_at DESC);

-- RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies (subjects)
CREATE POLICY "subjects: user owns" ON subjects
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies (folders)
CREATE POLICY "folders: user owns" ON folders
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies (photos)
CREATE POLICY "photos: user owns" ON photos
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Supabase Auth Config (Dashboard)

```
Authentication → Providers → Google:
  - Enable Google provider
  - Client ID: <Google Cloud Console Android Client ID>
  - Client Secret: <Google Cloud Console Secret>

Authentication → URL Configuration:
  - Site URL: exp://localhost:8081 (dev)
  - Redirect URLs: studysnap://auth/callback
```

---

## Phần 2: AI Service — NestJS (Phase 4 ONLY)

> ⚠️ KHÔNG setup phần này trước Phase 4. Đọc `.agents/rules/05-phase-gates.md`.

### Tech Stack AI Service

```
Runtime:    Node.js 20 LTS
Framework:  NestJS 10
Queue:      BullMQ 5 + Redis 7
AI:         Google Gemini API (@google/generative-ai)
Stream:     Server-Sent Events (SSE via NestJS @Sse)
Language:   TypeScript (strict mode)
```

### Setup AI Service (Phase 4)

```bash
# Tạo thư mục riêng trong monorepo
mkdir ai-service && cd ai-service
npx @nestjs/cli new . --package-manager npm --skip-git

# Core dependencies
npm install @nestjs/bull bull @google/generative-ai
npm install redis ioredis

# Type definitions
npm install -D @types/bull
```

### Cấu trúc thư mục AI Service

```
ai-service/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── photo/
│   │   ├── photo.module.ts
│   │   ├── photo.controller.ts    ← Nhận job từ app (REST + SSE)
│   │   ├── photo.processor.ts     ← BullMQ Worker xử lý queue
│   │   └── photo.service.ts       ← Gọi Gemini API
│   └── gemini/
│       ├── gemini.module.ts
│       └── gemini.service.ts      ← Wrapper Gemini Vision API
├── .env
└── docker-compose.yml             ← Redis local dev
```

### Queue Flow (3-layer pipeline tái dụng từ note-taking app)

```
[Mobile App] → POST /analyze-photo { photoId, storagePath }
      ↓
[NestJS Controller] → add job vào BullMQ queue
      ↓
[BullMQ Processor]
  1. Download ảnh từ Supabase Storage
  2. Convert to base64
  3. Gọi Gemini Vision API (multimodal)
  4. Parse response (OCR text, subject suggestion, summary)
  5. Update record trong Supabase DB
      ↓
[SSE] → emit event về mobile app { status, result }
```

### Gemini Vision Call Pattern

```ts
// ai-service/src/gemini/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

async function analyzePhoto(imageBase64: string): Promise<PhotoAnalysis> {
  const prompt = `
    Phân tích ảnh bài giảng/ghi chú học tập này:
    1. Trích xuất toàn bộ text (OCR)
    2. Gợi ý môn học: Toán/Lý/Hóa/Văn/Sử/Địa/Anh/Tin/khác
    3. Tóm tắt ngắn nội dung (1-2 câu)
    
    Trả về JSON: { "ocr_text": "...", "subject": "...", "summary": "..." }
  `
  
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
  ])
  
  return JSON.parse(result.response.text())
}
```

### Environment Variables AI Service

```env
# ai-service/.env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service role key (KHÔNG phải anon key)
GEMINI_API_KEY=AIza...
```

### Docker Compose (Local Dev AI Service)

```yaml
# ai-service/docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

```bash
# Khởi chạy Redis local
docker compose up -d redis

# Chạy NestJS dev
npm run start:dev
```

---

## Phần 3: Monorepo Structure (Phase 4+)

```
study/                   ← Root (git repo)
├── app/                 ← Expo Router screens (React Native)
├── src/                 ← RN source code
├── supabase/            ← Migrations + local config
├── ai-service/          ← NestJS AI service (Phase 4)
│   ├── src/
│   ├── package.json
│   └── docker-compose.yml
├── AGENTS.md
├── package.json         ← RN app package
└── app.json             ← Expo config
```

> Hai `package.json` riêng biệt — không dùng npm workspaces để tránh conflict giữa Expo + NestJS dependencies.
