# Storage & Auth

## Storage buckets

| Bucket | Nội dung | Public |
|---|---|---|
| `photos` | Ảnh gốc, path dạng `{user_id}/{photo_id}.jpg` | Không — truy cập qua signed URL |
| `thumbnails` | Ảnh thumbnail nén, cùng path pattern | Không |

## Row Level Security (RLS) — mẫu cho bảng `photos`

```sql
alter table photos enable row level security;

create policy "Users can CRUD own photos"
  on photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Áp dụng policy tương tự cho `subjects` và `folders` (dựa theo `user_id` trực tiếp, hoặc qua join tới `subjects.user_id` với `folders`).

Khi tới Giai đoạn 3 (nhóm chat), cần thêm policy riêng cho phép thành viên nhóm xem ảnh được share vào nhóm — không dùng chung policy "chỉ chủ sở hữu xem được" nữa.

## Auth

- Bật Email + Google provider trong Supabase Auth settings.
- Dùng `supabase.auth.signInWithOAuth({ provider: 'google' })` phía Expo app, redirect qua deep link (`myapp://auth-callback`).
- Lưu session bằng `expo-secure-store` thay vì AsyncStorage thường — an toàn hơn cho access token.
