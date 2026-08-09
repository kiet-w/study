# Giai đoạn 1 — Chụp & Phân loại (MVP)

## Mục tiêu

Chụp ảnh bài giảng và gắn đúng môn học trong tối đa 2 chạm, xem lại được ngay cả khi vừa chụp xong offline.

## Phạm vi

### 1. Quản lý môn học (`features/manage-subjects`)
- [ ] CRUD môn học: tên, màu, icon
- [ ] Danh sách môn hiển thị dạng chip màu ở màn hình chụp
- [ ] Seed sẵn vài môn phổ biến khi user tạo tài khoản lần đầu (tùy chọn)

### 2. Chụp ảnh (`features/capture-photo`)
- [ ] Màn hình camera full-screen, dải chip môn học nổi phía dưới
- [ ] Flow: chạm chọn môn (hoặc giữ môn đã chọn lần trước) → chạm chụp → ảnh lưu local ngay, không chờ upload
- [ ] Cho phép chụp liên tiếp nhiều ảnh cùng 1 môn không cần chọn lại

### 3. Đồng bộ ảnh (`features/sync-photos`)
- [ ] Ảnh lưu bằng `expo-file-system` local trước, đánh dấu trạng thái `pending`
- [ ] Background task upload lên Supabase Storage khi có mạng, cập nhật trạng thái `synced`
- [ ] UI hiển thị badge nhỏ trên ảnh chưa sync — không chặn thao tác khác

### 4. Thư viện xem lại (`widgets/photo-grid`)
- [ ] Lưới ảnh, lọc theo môn (chip filter) và theo ngày
- [ ] Tìm kiếm cơ bản theo tên môn
- [ ] Chạm vào ảnh → xem full-screen, xóa hoặc chuyển sang môn khác

### 5. Auth
- [ ] Đăng nhập bằng email hoặc Google qua Supabase Auth
- [ ] Chặn truy cập app nếu chưa đăng nhập (trừ màn hình login)

## Definition of Done

- Chụp được ảnh, gắn môn, thấy ảnh trong thư viện lọc đúng theo môn ngay cả khi tắt wifi lúc chụp.
- Mở lại app sau khi có mạng, ảnh tự động sync lên Supabase mà không cần thao tác thủ công.

## Liên quan

- Schema dùng: `subjects`, `photos` — xem `02-backend-supabase/database-schema.md`
