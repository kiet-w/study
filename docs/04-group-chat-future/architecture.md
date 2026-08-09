# (Giai đoạn 3 — chưa làm) Nhóm chat & chia sẻ

## Cơ chế

Dùng Supabase Realtime (Postgres Changes hoặc Broadcast channel) — không cần tự dựng WebSocket server bằng NestJS, tiết kiệm thời gian so với cách đã làm ở dự án NestJS trước đây.

## Luồng cơ bản

1. User tạo nhóm → sinh `invite_code`.
2. Bạn bè nhập code → join qua `group_members`.
3. Chia sẻ 1 ảnh vào nhóm (thêm liên kết ảnh–nhóm, hoặc copy record).
4. Bình luận/tag trên ảnh → ghi vào `photo_comments`, subscribe Realtime channel theo `group_id` để các thành viên thấy comment mới ngay lập tức.

## Việc cần làm khi tới giai đoạn này

- Thiết kế lại RLS cho `photos` để cho phép thành viên nhóm xem ảnh được share (hiện tại chỉ chủ sở hữu xem được).
- Quyết định: ảnh share vào nhóm là bản sao hay chỉ là link tới ảnh gốc — ảnh hưởng đến việc đồng bộ khi chủ ảnh xóa/sửa.
