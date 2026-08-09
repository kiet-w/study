# Docs — StudySnap Android App

Thư mục này là tài liệu kỹ thuật cho dự án app Android "chụp & sắp xếp kiến thức bài giảng theo môn học". Được tổ chức theo từng khu vực (mobile app, backend, và các module mở rộng trong tương lai) để AI coding assistant (Claude Code, Gemini CLI, Cursor...) hoặc người mới vào dự án tra cứu nhanh: đọc tên folder là biết code/tính năng đó thuộc về đâu.

## Cách đọc thư mục này

| Folder | Nội dung |
|---|---|
| `00-overview/` | Vấn đề đang giải quyết, tầm nhìn sản phẩm, roadmap tổng thể theo giai đoạn |
| `01-mobile-app/` | Tech stack, cấu trúc source code, spec chi tiết từng giai đoạn của app Android |
| `02-backend-supabase/` | Schema database, storage, auth, các bước setup Supabase |
| `03-ai-service-future/` | (Giai đoạn 4) Dịch vụ AI phân tích ảnh — chưa làm, để tham khảo khi tới lúc |
| `04-group-chat-future/` | (Giai đoạn 3) Nhóm chat & chia sẻ — chưa làm |
| `05-calendar-future/` | (Giai đoạn 5) Tích hợp lịch học — chưa làm |

## Quy tắc chung khi code theo docs này

- Giai đoạn 1 và 2 là ưu tiên hiện tại — code thật nằm trong app Android (Expo).
- Các folder có hậu tố `-future/` chỉ là tài liệu thiết kế, chưa có code tương ứng — đừng scaffold trước khi tới giai đoạn đó.
- Mỗi file `phase-*.md` có checklist implementation — dùng làm task list khi code.
- Nguồn sự thật cho schema database luôn là `02-backend-supabase/database-schema.md`, không lặp lại schema ở nơi khác trong repo.
