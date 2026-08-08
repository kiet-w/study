# Flow: Photo Upload (Offline → Supabase)

> Background sync flow — ảnh chụp local được upload khi có mạng.

## State Machine

```
LOCAL ONLY
  │
  ├─ có mạng, app foreground → UPLOADING
  │       ↓ success           → SYNCED
  │       ↓ error < 3 retries → PENDING (back to queue)
  │       ↓ error >= 3 retries→ FAILED (user phải retry thủ công)
  │
  └─ không mạng              → PENDING (stay, retry khi có mạng)
```

---

## Upload Queue (usePhotoStore)

```ts
// src/store/usePhotoStore.ts
interface Photo {
  id: string            // local UUID (gen trước khi upload)
  localPath: string     // expo-file-system path
  subjectId: string
  folderId?: string
  takenAt: Date
  note?: string
  
  // Sync state
  synced: boolean
  syncStatus: 'pending' | 'uploading' | 'done' | 'failed'
  retries: number
  lastError?: string
}
```

---

## Upload Service

```ts
// src/lib/photoUpload.ts

const RETRY_DELAYS = [2000, 5000, 15000] // ms

async function uploadPhoto(photo: Photo): Promise<void> {
  const userId = await getCurrentUserId()
  
  // 1. Bước 1: Upload file lên Storage
  const storagePath = `${userId}/${photo.subjectId}/${photo.id}.jpg`
  const fileData = await FileSystem.readAsStringAsync(photo.localPath, {
    encoding: FileSystem.EncodingType.Base64,
  })
  
  const { error: storageError } = await supabase.storage
    .from('photos')
    .upload(storagePath, decode(fileData), { contentType: 'image/jpeg' })
  
  if (storageError) throw storageError
  
  // 2. Bước 2: Lấy URL public
  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(storagePath)
  
  // 3. Bước 3: Insert record vào DB
  const { error: dbError } = await supabase.from('photos').insert({
    id: photo.id,
    user_id: userId,
    subject_id: photo.subjectId,
    folder_id: photo.folderId,
    storage_path: storagePath,
    taken_at: photo.takenAt.toISOString(),
    note: photo.note,
  })
  
  if (dbError) throw dbError
  
  // 4. Bước 4: Mark synced trong local store
  usePhotoStore.getState().markSynced(photo.id)
}
```

---

## Background Sync Hook

```ts
// src/hooks/usePhotoSync.ts
// Gọi ở root _layout.tsx, chạy suốt vòng đời app

export function usePhotoSync() {
  const pendingPhotos = usePhotoStore(s => s.getPending())
  const isConnected = useNetworkStatus()

  useEffect(() => {
    if (!isConnected || pendingPhotos.length === 0) return
    
    // Process 1 ảnh tại 1 thời điểm (không flood bandwidth)
    const next = pendingPhotos[0]
    uploadWithRetry(next)
  }, [isConnected, pendingPhotos.length])
}
```

---

## Thumbnail Generation

```ts
// Tạo thumbnail local TRƯỚC khi upload ảnh gốc
// → UI luôn có ảnh preview, không cần chờ upload

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

async function createThumbnail(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, 
    [{ resize: { width: THUMBNAIL_SIZE } }],  // 200px width
    { compress: 0.7, format: SaveFormat.JPEG }
  )
  return result.uri
}
```

---

## Network Detection

```ts
// src/hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo'

export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(true)
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false)
    })
    return unsubscribe
  }, [])
  
  return isConnected
}
```

---

## Delete Flow

```ts
// User xóa ảnh đã upload
async function deletePhoto(photo: Photo) {
  // 1. Xóa local ngay → UI update ngay
  await FileSystem.deleteAsync(photo.localPath, { idempotent: true })
  usePhotoStore.getState().removePhoto(photo.id)
  
  // 2. Nếu đã sync → delete trên Supabase nền
  if (photo.synced) {
    // Không block UI, fire and forget với retry
    deleteFromSupabase(photo.id, photo.storagePath)
  }
  // Nếu chưa sync → chỉ cần xóa local, không gửi request
}
```
