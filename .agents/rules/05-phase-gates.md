# Rule 05 — Phase Gates (Không Nhảy Cóc)

## Quy tắc cốt lõi

**Không implement feature của Phase N+1 khi Phase N chưa có demo chạy được trên thiết bị thật.**

---

## Phase Map & Dependencies

```
Phase 0: Setup (PREREQUISITE — phải xong trước mọi thứ)
  ✓ Expo project khởi tạo xong
  ✓ Supabase project tạo xong, kết nối được
  ✓ EAS Build tạo được APK cài trên điện thoại thật
  ✓ DB schema migration apply thành công
  ✓ Auth Google/Email login/logout được
  → Unblock: Phase 1

Phase 1: MVP (Core — lý do app tồn tại)
  ✓ Chụp ảnh bằng camera trong app được
  ✓ Ảnh lưu vào đúng môn đã chọn
  ✓ Xem lại ảnh theo lưới (filtered by subject)
  ✓ Offline: chụp được khi không có mạng, tự sync sau
  ✓ CRUD môn học (tên + màu + icon)
  → Unblock: Phase 2

Phase 2: UX Polish
  Dependencies: Phase 1 phải xong 100%
  ✓ Folder/chương trong từng môn
  ✓ Kéo thả sắp xếp ảnh
  ✓ Export PDF
  ✓ Nén ảnh trước upload
  → Unblock: Phase 3

Phase 3: Social / Groups
  Dependencies: Phase 1 + Phase 2
  ✓ Tạo nhóm bằng mã mời
  ✓ Chia sẻ ảnh vào nhóm
  ✓ Tag bạn bè
  ✓ Bình luận
  ✓ Supabase Realtime hoạt động
  → Unblock: Phase 4

Phase 4: AI Features
  Dependencies: Phase 1 (upload pipeline) phải stable
  ✓ NestJS service deploy được
  ✓ BullMQ + Redis setup
  ✓ Gemini Vision API trả OCR text
  ✓ Flashcard generation
  → Unblock: Phase 5

Phase 5: Schedule / Smart Suggestions
  Dependencies: Phase 1 + Phase 4
```

---

## Khi AI Coding Agent Nhận Task

Trước khi code, hỏi (hoặc tự xác định):
1. Task này thuộc Phase nào?
2. Phase đó đã unlock chưa (phase trước có "✓" hết chưa)?
3. Nếu chưa unlock → báo user, không tự tiện implement

---

## Được Phép Chuẩn Bị Trước (Không Vi Phạm Rule)

```
✅ Viết types/interfaces cho Phase sau (không tốn công implement)
✅ Viết TODO comment: // Phase 4: add Gemini OCR call here
✅ Thiết kế DB schema cho Phase sau (trong migration file riêng)
❌ Implement logic Phase 4 khi Phase 1 chưa xong
❌ Add BullMQ dependency khi Phase 4 chưa bắt đầu (YAGNI)
```

---

## Dấu Hiệu Đang Vi Phạm Rule

```
"Mình implement luôn nhóm chat vì đang viết auth flow anyway"  ← DỪNG
"Mình add Gemini API để test trước"                            ← DỪNG  
"Mình refactor folder structure cho Phase 4 ready"             ← DỪNG
```

Nếu thấy mình đang nghĩ những câu trên → dừng lại, hỏi user có muốn skip không.
