# Rule 04 — Offline-First (BẮT BUỘC từ Phase 1)

## Tại sao

Wifi/4G Việt Nam không ổn định, đặc biệt trong giảng đường. Nếu app chờ upload xong mới cho chụp tiếp → học sinh mất ảnh hoặc bỏ dùng app.

**Nguyên tắc cốt lõi:** Ảnh phải được lưu local TRƯỚC, upload là background task.

---

## Flow Bắt Buộc

```
[User chụp ảnh]
      ↓
[Lưu vào local storage ngay lập tức]  ← Không được skip bước này
      ↓
[Hiển thị ảnh trên UI ngay] ← User thấy kết quả tức thì
      ↓
[Add vào upload queue]
      ↓
[Background: upload lên Supabase Storage khi có mạng]
      ↓
[Cập nhật synced=true trong local DB]
```

---

## Implementation

### Local Storage (Phase 1)
```ts
// Dùng expo-file-system để cache ảnh trước khi upload
import * as FileSystem from 'expo-file-system'

const LOCAL_PHOTO_DIR = FileSystem.documentDirectory + 'photos/'

// Lưu ảnh local
async function savePhotoLocal(uri: string, photoId: string): Promise<string> {
  const localPath = LOCAL_PHOTO_DIR + photoId + '.jpg'
  await FileSystem.copyAsync({ from: uri, to: localPath })
  return localPath
}
```

### Upload Queue (Zustand store)
```ts
// src/store/usePhotoStore.ts
interface PhotoQueueItem {
  id: string
  localPath: string
  subjectId: string
  folderId?: string
  status: 'pending' | 'uploading' | 'done' | 'failed'
  retries: number
}

// Queue persist qua app restart bằng MMKV hoặc AsyncStorage
```

### Sync Strategy
```ts
// Retry với backoff
const MAX_RETRIES = 3
const RETRY_DELAY_MS = [2000, 5000, 15000] // 2s, 5s, 15s

// Chỉ sync khi:
// 1. Có kết nối mạng (NetInfo)
// 2. App ở foreground
// 3. Status là 'pending' hoặc 'failed' với retries < MAX_RETRIES
```

---

## State trong UI

```tsx
// Hiển thị trạng thái sync cho user
// ✅ Làm thế này
<PhotoCard
  photo={photo}
  syncStatus={photo.synced ? 'synced' : 'pending'}
/>

// Badge nhỏ góc ảnh:
// ⏳ = đang chờ upload
// ✅ = đã sync lên cloud
// ❌ = lỗi, tap để retry
```

---

## Quy tắc KHÔNG được làm

```
❌ Không await upload trước khi show ảnh trên UI
❌ Không block camera capture vì đang upload
❌ Không xóa local cache trước khi confirmed upload success
❌ Không bỏ qua network error — phải queue lại để retry
```

---

## Handling khi xóa ảnh

```
User xóa ảnh:
1. Xóa khỏi local storage NGAY
2. Nếu đã upload → thêm vào "delete queue" → xóa trên Supabase sau
3. Nếu chưa upload → chỉ xóa local, không cần gửi request
```
