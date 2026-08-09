# Tầm nhìn & Roadmap

## Vấn đề

Học sinh/sinh viên chụp ảnh bài giảng, bảng viết, slide bằng điện thoại nhưng ảnh rơi thẳng vào Album chung của máy — lẫn lộn với ảnh cá nhân, khó xem lại, khó chia sẻ, và các môn học (Vật lý, Hóa học...) bị trộn lẫn không phân loại được.

## Giải pháp — Giai đoạn 1 (MVP, ưu tiên hiện tại)

App Android cho phép:
1. Chụp ảnh bài giảng
2. Gắn ảnh vào đúng môn học ngay lúc chụp (hoặc ngay sau đó)
3. Xem lại theo môn, theo ngày

## Mở rộng tương lai (chưa làm, chỉ để định hướng kiến trúc ngay từ đầu)

| Giai đoạn | Tính năng | Trạng thái |
|---|---|---|
| 1 | Chụp ảnh + phân loại theo môn (MVP) | Đang làm |
| 2 | Album/chương trong môn, export PDF, nén ảnh | Chưa làm |
| 3 | Nhóm chat, chia sẻ ảnh, tag bạn bè | Chưa làm |
| 4 | AI phân tích ảnh (OCR, tóm tắt, flashcard) | Chưa làm |
| 5 | Tích hợp lịch học trên trường | Chưa làm |

## Nguyên tắc thiết kế

- **Offline-first**: học sinh chụp ảnh trong lớp, mạng có thể yếu — ảnh phải lưu local ngay, upload nền sau, không được chặn thao tác chụp tiếp theo.
- **Tối thiểu thao tác lúc chụp**: đang ngồi nghe giảng, flow chụp + gắn môn phải nhanh nhất có thể (mục tiêu ≤ 2 chạm).
- **Tái sử dụng hạ tầng đã có**: dùng lại Supabase (giống webapp hiện tại) và pattern NestJS + BullMQ + SSE + Gemini (giống note-taking app đã làm) khi tới giai đoạn AI, thay vì xây mới từ đầu.
