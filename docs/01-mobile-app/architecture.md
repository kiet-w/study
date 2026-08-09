# (Giai đoạn 4 — chưa làm) Dịch vụ AI phân tích ảnh

Tài liệu thiết kế trước, để tham khảo khi tới giai đoạn này. Tái sử dụng đúng pattern đã dùng ở note-taking app (NestJS + BullMQ + SSE + Gemini API, kiến trúc pipeline 3 lớp prompt).

## Luồng xử lý

1. App upload ảnh lên Supabase Storage, tạo record `photos` với `ai_status = 'queued'`.
2. NestJS service nhận event (qua Supabase Database Webhook hoặc polling), đẩy job vào BullMQ.
3. Worker lấy ảnh, gọi Gemini Vision API — OCR nội dung, tóm tắt, gợi ý flashcard.
4. Kết quả ghi vào `photos.ocr_text`, `photos.ai_summary`, cập nhật `ai_status = 'done'`.
5. Trả tiến độ về app qua SSE — giống cơ chế báo tiến độ đã làm ở note-taking app.

## Vì sao tách NestJS riêng thay vì Supabase Edge Function

Xử lý ảnh hàng loạt (nhiều ảnh cùng lúc sau 1 buổi học) cần hàng đợi (BullMQ) và retry logic phức tạp hơn mức Edge Function xử lý tốt — dùng lại service NestJS đã có kinh nghiệm thay vì học lại một cách làm mới.
