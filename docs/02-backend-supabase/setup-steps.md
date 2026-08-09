# Các bước setup Supabase

1. Tạo project mới trên supabase.com — tách riêng khỏi project của webapp hiện tại để tránh lẫn dữ liệu.
2. Vào SQL Editor, chạy lần lượt các block SQL trong `database-schema.md` — bắt đầu từ phần "Giai đoạn 1" thôi, chưa chạy các phần đánh dấu tương lai.
3. Vào Storage, tạo 2 bucket: `photos`, `thumbnails` — để private.
4. Áp RLS policy theo `storage-and-auth.md`.
5. Vào Authentication → Providers, bật Email và Google.
6. Copy `Project URL` và `anon public key` vào file `.env` của Expo app:
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
7. Test kết nối bằng 1 query đơn giản (`select * from subjects limit 1`) từ app trước khi build feature thật.
