# Rule 01 — Critical Files (Không Sửa Không Có Lệnh)

## 🔴 PROTECTED — Phải xin phép user trước khi sửa

### Supabase & Auth
```
src/lib/supabase.ts          — client singleton, RLS config
src/store/useAuthStore.ts    — session state, login/logout logic
```
**Sai ở đây →** auth bị loop, user bị logout, mất session.

### Photo Pipeline (Core Feature)
```
src/store/usePhotoStore.ts   — upload queue, sync state
src/hooks/usePhotoSync.ts    — background upload logic
```
**Sai ở đây →** ảnh mất trước khi upload, queue bị corrupt.

### Database
```
supabase/migrations/*.sql    — schema production
```
**Sai ở đây →** data production bị drop/mất. KHÔNG bao giờ viết raw migration mà không test trên local Supabase trước.

### Routing
```
app/_layout.tsx              — root layout, auth guard, tab navigator
```
**Sai ở đây →** toàn bộ routing vỡ.

---

## 🟡 CAREFUL — Sửa được nhưng phải trace impact trước

```
src/types/index.ts           — core types dùng khắp nơi, đổi type là đổi toàn app
src/lib/storage.ts           — local cache layer, offline-first logic
src/hooks/useCamera.ts       — expo-camera wrapper
```

---

## 🟢 SAFE — Thoải mái sửa

```
src/components/**/*          — UI components, style, layout
src/lib/utils.ts             — helper functions
assets/**/*                  — images, fonts
app/(tabs)/styles/           — screen-level styles
```

---

## Quy trình khi phát hiện lỗi liên quan critical files

1. **DỪNG** thay đổi khác đang làm
2. Report ngay: file nào bị ảnh hưởng, diff là gì
3. Không tự ý "fix nhanh" rồi tiếp tục
4. Đợi user xác nhận hướng fix
