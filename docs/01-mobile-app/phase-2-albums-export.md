# Giai đoạn 2 — Hoàn thiện trải nghiệm

Chưa bắt đầu — chỉ làm sau khi Giai đoạn 1 hoàn thành và đã dùng thử ổn định.

## Phạm vi

### 1. Album/chương trong môn
- [ ] Thêm bảng `folders` (chương/buổi học) trong 1 môn
- [ ] Cho phép gắn ảnh vào 1 folder cụ thể, hoặc để "chưa phân loại"
- [ ] Sắp xếp lại thứ tự ảnh trong 1 buổi bằng kéo thả

### 2. Export PDF
- [ ] Chọn 1 môn hoặc 1 folder → xuất toàn bộ ảnh thành 1 file PDF theo thứ tự
- [ ] Dùng thư viện tạo PDF phía client (ví dụ `expo-print`) — không cần backend xử lý

### 3. Nén ảnh
- [ ] Resize + nén ảnh bằng `expo-image-manipulator` trước khi upload (giảm dung lượng Storage, tăng tốc sync)
- [ ] Giữ lại ảnh gốc local, chỉ nén bản upload lên Storage

## Liên quan

- Schema thêm mới: `folders` — xem `02-backend-supabase/database-schema.md`
