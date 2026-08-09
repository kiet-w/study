# Rule 01 — Critical Files (Không Sửa Khi Không Có Lệnh)

> **Mục đích:** Bảo vệ các file hạt nhân của hệ thống Frontend & Backend khỏi nguy cơ hỏng hóc dây chuyền.

---

## 🔴 PROTECTED — Phải kiểm tra cực kỳ kỹ trước khi chỉnh sửa

### 1. Frontend Client & Auth
```
frontend/src/lib/supabase.ts           — Supabase Singleton Client & auth session initialization
frontend/src/store/useAuthStore.ts     — Auth session state manager (Zustand persist)
```
**Rủi ro nếu sai:** Auth bị loop, user bị logout đột ngột, mất token session.

### 2. Frontend Photo Pipeline
```
frontend/src/store/usePhotoStore.ts    — Queue upload ảnh local & sync status
frontend/src/hooks/usePhotoSync.ts     — Logic upload nền & retry khi mất mạng
```
**Rủi ro nếu sai:** Mất ảnh vừa chụp trước khi sync, queue bị hỏng.

### 3. Backend NestJS Core Infrastructure
```
backend/src/main.ts                    — NestFactory, ValidationPipe, Swagger setup, CORS
backend/src/app.module.ts              — Root AppModule chứa toàn bộ module imports
backend/src/shared/prisma/prisma.service.ts — Service kết nối DB chính của Prisma ORM
backend/prisma/schema.prisma           — Prisma ORM Schema mapping Database PostgreSQL
```
**Rủi ro nếu sai:** Backend crash khi khởi chạy, lỗi kết nối DB toàn hệ thống, API bị mất middleware validation.

### 4. Database Schema Production
```
supabase/migrations/*.sql              — SQL migration files trên Supabase Production
.env                                   — Variables, secrets, DB connection strings
```
**Rủi ro nếu sai:** Lệch schema, mất dữ liệu production, rò rỉ API secrets.

---

## 🟡 CAREFUL — Được sửa nhưng phải trace ảnh hưởng trước

```
frontend/src/types/index.ts            — Core interfaces dùng toàn ứng dụng Frontend
backend/src/shared/types/common.types.ts — Common DTOs & response interfaces Backend
frontend/src/lib/storage.ts            — Storage wrapper cho AsyncStorage / SecureStore
```

---

## 🟢 SAFE — Thoải mái bổ sung & chỉnh sửa

```
frontend/src/components/**/*           — Components UI
backend/src/modules/*/*.controller.ts  — API Endpoints mới
backend/src/modules/*/*.service.ts     — Business logic mới
```
