# Flow: Photo Upload (`features/sync-photos`)

> Nguồn sự thật: `docs/01-mobile-app/phase-1-capture-categorize.md`

## Nguyên tắc

**Ảnh phải lưu local TRƯỚC — upload là background task.**  
Wifi/4G trong lớp học VN không ổn định, không được block thao tác chụp tiếp.

---

## State Machine

```
pending  ──(có mạng)──▶  uploading  ──(success)──▶  synced
   ▲                         │
   └────(error < 3)──────────┘  error retry delay: 2s / 5s / 15s
                              │
                         (error ≥ 3)──▶  failed (user retry thủ công)
```

---

## FSD Placement

```
src/features/sync-photos/
  usePhotoSync.ts         ← background sync hook (gọi ở _layout.tsx root)
  photoUpload.ts          ← upload 1 ảnh lên Supabase Storage + insert DB
src/store/
  usePhotoStore.ts 🔴     ← queue state (persist qua AsyncStorage)
src/shared/lib/
  storage.ts              ← expo-file-system helpers (saveLocal, deleteLocal)
```

---

## Photo Store Schema

```ts
// src/store/usePhotoStore.ts — 🔴 CRITICAL FILE
interface LocalPhoto {
  id: string
  localPath: string       // expo-file-system path
  subjectId: string
  takenAt: Date
  note?: string
  synced: boolean
  syncStatus: 'pending' | 'uploading' | 'done' | 'failed'
  retries: number
}
```

---

## Thumbnail Generation (trước khi upload)

```ts
// src/shared/lib/storage.ts
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

export async function createThumbnail(uri: string): Promise<string> {
  const result = await manipulateAsync(uri,
    [{ resize: { width: THUMBNAIL_WIDTH } }],   // 200px — từ constants.ts
    { compress: 0.7, format: SaveFormat.JPEG }
  )
  return result.uri
}
```

---

## Upload Flow (1 ảnh)

```ts
// src/features/sync-photos/photoUpload.ts
async function uploadPhoto(photo: LocalPhoto, userId: string): Promise<void> {
  const storagePath = `${userId}/${photo.id}.jpg`
  const thumbPath = `${userId}/${photo.id}.jpg`

  // 1. Nén + tạo thumbnail
  const thumbnailUri = await createThumbnail(photo.localPath)

  // 2. Upload ảnh gốc lên bucket 'photos'
  const file = await FileSystem.readAsStringAsync(photo.localPath, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const { error: photoErr } = await supabase.storage
    .from('photos')
    .upload(storagePath, decode(file), { contentType: 'image/jpeg', upsert: false })
  if (photoErr) throw photoErr

  // 3. Upload thumbnail lên bucket 'thumbnails'
  const thumb = await FileSystem.readAsStringAsync(thumbnailUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  await supabase.storage
    .from('thumbnails')
    .upload(thumbPath, decode(thumb), { contentType: 'image/jpeg', upsert: false })

  // 4. Insert record vào DB
  const { error: dbErr } = await supabase.from('photos').insert({
    id: photo.id,
    user_id: userId,
    subject_id: photo.subjectId,
    storage_path: storagePath,
    thumbnail_path: thumbPath,
    taken_at: photo.takenAt.toISOString(),
    note: photo.note,
    sync_status: 'synced',
  })
  if (dbErr) throw dbErr
}
```

---

## Background Sync Hook

```ts
// src/features/sync-photos/usePhotoSync.ts
// Gọi ở app/_layout.tsx — chạy suốt vòng đời app

export function usePhotoSync() {
  const { pendingPhotos, markUploading, markSynced, markFailed } = usePhotoStore()
  const isConnected = useNetworkStatus()

  useEffect(() => {
    if (!isConnected) return
    const next = pendingPhotos.find(p => p.syncStatus === 'pending')
    if (!next) return

    markUploading(next.id)
    uploadWithRetry(next)
      .then(() => markSynced(next.id))
      .catch(() => markFailed(next.id))  // retry logic trong uploadWithRetry
  }, [isConnected, pendingPhotos.length])
}
```

---

## Xóa Ảnh

```ts
// Xóa local NGAY → UI update ngay
await FileSystem.deleteAsync(photo.localPath, { idempotent: true })
removeFromStore(photo.id)

// Nếu đã sync → xóa trên Supabase nền (fire-and-forget với retry)
if (photo.synced) {
  supabase.storage.from('photos').remove([`${userId}/${photo.id}.jpg`])
  supabase.storage.from('thumbnails').remove([`${userId}/${photo.id}.jpg`])
  supabase.from('photos').delete().eq('id', photo.id)
}
// Nếu chưa sync → chỉ xóa local, không gửi request nào
```

---

## UI States

```
Ảnh vừa chụp: badge ⏳ pending
Đang upload:  badge 🔄 (spinner nhỏ)
Đã sync:      badge ✅ (hoặc không hiện badge)
Upload lỗi:   badge ❌ (tap để retry thủ công)
```
