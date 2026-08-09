# (Giai đoạn 5 — chưa làm) Tích hợp lịch học

## Mục tiêu

Khi user chụp ảnh trong khung giờ tiết học, app tự gợi ý đúng môn học tương ứng — bớt 1 thao tác chọn môn thủ công.

## Cách làm

1. User nhập thời khóa biểu vào bảng `class_sessions` (thứ, giờ bắt đầu/kết thúc, môn).
2. Khi mở màn hình chụp, app query xem giờ hiện tại có khớp `class_sessions` nào không → tự chọn sẵn môn đó.
3. User vẫn có thể đổi môn thủ công nếu gợi ý sai.

## Tùy chọn mở rộng

Đồng bộ 2 chiều với Google Calendar thay vì tự nhập TKB — cân nhắc sau khi có phản hồi thực tế từ việc tự nhập tay có đủ dùng hay không.
