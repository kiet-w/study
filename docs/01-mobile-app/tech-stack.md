# Tech stack — Mobile app

## Nền tảng

React Native + Expo (Expo Router cho navigation dựa trên file system — quen thuộc nếu đã dùng Next.js App Router).

Lý do: tái sử dụng kiến thức React/Next.js sẵn có, build được cả Android lẫn iOS từ 1 codebase, EAS Build lo phần build/release.

## Thư viện chính

| Nhu cầu | Thư viện | Ghi chú |
|---|---|---|
| Camera | `expo-camera` | Chụp ảnh trực tiếp trong app |
| Chọn ảnh từ máy | `expo-image-picker` | Fallback khi không chụp trực tiếp |
| Navigation | `expo-router` | File-based routing, giống App Router |
| Styling | `nativewind` | Cú pháp Tailwind cho RN — giữ quen tay nếu đã dùng Tailwind ở webapp |
| Quản lý state (môn, ảnh) | `zustand` | Nhẹ, đơn giản hơn Redux cho quy mô app này |
| Backend client | `@supabase/supabase-js` | Auth, Postgres, Storage |
| Local cache ảnh trước upload | `expo-file-system` | Lưu ảnh local, đánh dấu trạng thái đã/chưa sync |
| Upload nền | `expo-task-manager` + `expo-background-fetch` | Upload ảnh khi có mạng trở lại, kể cả khi app chạy nền |
| Nén ảnh | `expo-image-manipulator` | Resize/nén trước khi upload, tiết kiệm Storage |
| Lưu session an toàn | `expo-secure-store` | Lưu Supabase auth token |

## Không dùng ở giai đoạn 1

- Không cần Supabase Realtime / WebSocket — để dành Giai đoạn 3 (nhóm chat).
- Không cần AI SDK nào — để dành Giai đoạn 4.
- Không cần thư viện lịch/calendar — để dành Giai đoạn 5.
