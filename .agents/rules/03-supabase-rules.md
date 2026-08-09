# Rule 03 — Supabase Rules

## Client Singleton (`frontend/src/lib/supabase.ts`) — 🔴 CRITICAL

```ts
// File này đã tồn tại — KHÔNG tạo thêm createClient() ở bất kỳ đâu khác
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## Schema (Nguồn sự thật: `docs/02-backend-supabase/database-schema.md`)

**Phase 1 tables (đang dùng):**
```
categories (id, user_id, name, color, icon, sort_order, created_at)
photos     (id, user_id, category_id, topic_id, storage_path, thumbnail_path,
            taken_at, note, sync_status, created_at)
```

**Phase 2+:** `topics` (chưa tạo)  
**Phase 3+:** `groups`, `group_members`, `photo_comments` (chưa tạo)  
**Phase 4+:** thêm `ocr_text`, `ai_summary`, `ai_status` vào `photos` (chưa làm)

→ Không tự thêm column/table nếu chưa được mô tả trong docs schema.

---

## Storage Buckets

Có **2 buckets riêng biệt** (cả 2 đều **private** — dùng signed URL):

| Bucket | Nội dung | Path pattern |
|:-------|:---------|:-------------|
| `photos` | Ảnh gốc | `{user_id}/{photo_id}.jpg` |
| `thumbnails` | Ảnh nén (200px width) | `{user_id}/{photo_id}.jpg` |

```ts
// ✅ Upload ảnh gốc
await supabase.storage.from('photos').upload(
  `${userId}/${photoId}.jpg`,
  fileBlob,
  { contentType: 'image/jpeg', upsert: false }
)

// ✅ Lấy signed URL (30 phút)
const { data } = await supabase.storage
  .from('photos')
  .createSignedUrl(`${userId}/${photoId}.jpg`, 1800)
```

---

## Query Patterns

```ts
// SELECT — chỉ lấy columns cần thiết
const { data, error } = await supabase
  .from('categories')
  .select('id, name, color, icon, sort_order')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// INSERT — return inserted row
const { data, error } = await supabase
  .from('categories')
  .insert({ name, color, icon, user_id: userId })
  .select('id, name, color, icon, sort_order')
  .single()

// UPDATE — luôn có .eq('user_id') để đảm bảo ownership
const { error } = await supabase
  .from('categories')
  .update({ name: newName })
  .eq('id', categoryId)
  .eq('user_id', userId)

// DELETE — confirm ownership trước
const { error } = await supabase
  .from('photos')
  .delete()
  .eq('id', photoId)
  .eq('user_id', userId)
```

---

## RLS (Row Level Security) — BẮT BUỘC

Mọi table đều bật RLS. Template:

```sql
alter table categories enable row level security;
alter table topics enable row level security;
alter table photos enable row level security;

create policy "Users can CRUD own categories"
  on categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
