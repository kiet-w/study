# Rule 03 — Supabase Rules

## Client

```ts
// src/lib/supabase.ts — SINGLETON, không tạo thêm client khác
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Không bao giờ** tạo `createClient()` thứ hai ở bất kỳ file nào khác.

---

## Query Patterns

### SELECT — luôn chỉ định columns cần thiết
```ts
// ✅ Chỉ lấy những gì cần
const { data } = await supabase
  .from('subjects')
  .select('id, name, color, icon')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// ❌ Không select(*)  khi không cần hết
const { data } = await supabase.from('subjects').select('*')
```

### INSERT
```ts
// ✅ Luôn return inserted row để sync state
const { data, error } = await supabase
  .from('subjects')
  .insert({ name, color, icon, user_id: userId })
  .select('id, name, color, icon')
  .single()
```

### UPDATE
```ts
// ✅ Luôn có WHERE clause (user_id hoặc id)
const { error } = await supabase
  .from('subjects')
  .update({ name: newName })
  .eq('id', subjectId)
  .eq('user_id', userId) // double check ownership
```

### DELETE
```ts
// ✅ Phải confirm user ownership trước khi delete
const { error } = await supabase
  .from('photos')
  .delete()
  .eq('id', photoId)
  .eq('user_id', userId)
```

---

## Row Level Security (RLS) — BẮT BUỘC

Mọi table đều bật RLS. Mọi policy đều check `user_id = auth.uid()`.

```sql
-- Template policy cho mọi table
CREATE POLICY "Users own their data" ON table_name
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own data" ON table_name
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

**Không được** tắt RLS để "test nhanh" rồi quên bật lại.

---

## Storage

```ts
// Path convention: {user_id}/{subject_id}/{photo_id}.jpg
const storagePath = `${userId}/${subjectId}/${photoId}.jpg`

// Upload
const { error } = await supabase.storage
  .from('photos')             // bucket name cố định
  .upload(storagePath, file, {
    contentType: 'image/jpeg',
    upsert: false,            // không overwrite — mỗi ảnh là unique
  })

// Get URL (public bucket)
const { data } = supabase.storage
  .from('photos')
  .getPublicUrl(storagePath)
```

---

## Auth & User Model Decision

- **KHÔNG tạo model `User` riêng** (bảng `users` riêng) trong Prisma hay Database. Supabase Auth đã tự động quản lý `auth.users`.
- Các bảng (`categories`, `topics`, `photos`) chỉ lưu `user_id` (`String @db.Uuid`).
- Khi lưu/truy vấn data, dùng `user.id` lấy trực tiếp từ `supabase.auth.getUser()`.

```ts
// Lấy user hiện tại — luôn check null
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // redirect to login
  router.replace('/(auth)/login')
  return
}

// Dùng user.id trực tiếp cho các queries
const { data } = await supabase.from('photos').select('*').eq('user_id', user.id)

// Listen auth state change (trong root _layout.tsx)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') router.replace('/(auth)/login')
  if (event === 'SIGNED_IN') router.replace('/(tabs)')
})
```

---

## Schema Structure (Category -> Topic -> Photo)

- **`categories`**: Danh mục lớn (VD: "Công nghệ thông tin", "Đại học").
- **`topics`**: Chủ đề / Môn học thuộc Category (VD: "Giải tích 1", "Vật lý đại cương").
- **`photos`**: Ảnh bài giảng, liên kết `user_id`, `category_id`, `topic_id`, `storage_path`, `synced`.
- Chi tiết Prisma schema xem tại [`prisma/schema.prisma`](file:///home/baudui/study_repo/prisma/schema.prisma).

---

## Realtime (Phase 3+)

Không implement Realtime cho đến Phase 3. Khi đến Phase 3 mới đọc rule này thêm.

---

## Migrations

- File đặt tên: `YYYYMMDD_description.sql` (VD: `20260809_initial_schema.sql`)
- Luôn test trên **Supabase local** (`supabase start`) trước khi apply production
- Không viết destructive migration (DROP TABLE, DROP COLUMN) mà không backup
- Mỗi migration chỉ làm 1 việc, không gom nhiều thay đổi vào 1 file
