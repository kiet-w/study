# Flow: Camera Capture

> Màn hình chụp ảnh — core feature của StudySnap.

## UX Decision (đã chốt)

**Chọn môn TRƯỚC → bấm chụp** (không phải chụp rồi mới gắn môn)  
Lý do: Học sinh đang nghe giảng, tốc độ quan trọng hơn linh hoạt.

---

## User Flow

```
[Tab Camera]
      ↓
[Hiển thị chip chọn môn (ngang, scroll được)]
  → màu chip = màu môn học (nhận diện bằng màu, không cần đọc chữ)
  → môn gần đây nhất được pre-select tự động
      ↓
[User tap chip chọn môn] (optional: giữ môn cũ nếu cùng buổi học)
      ↓
[Viewfinder camera chiếm phần lớn màn hình]
      ↓
[User tap nút chụp (hoặc volume button)]
      ↓
[Flash preview 0.3s] → không block
      ↓
[Lưu local + add queue] ← Rule 04: offline-first
      ↓
[Sẵn sàng chụp tiếp NGAY LẬP TỨC]
      ↓
[Góc dưới phải: thumbnail ảnh vừa chụp (tap → xem chi tiết)]
```

---

## Component Structure

```
app/(tabs)/camera.tsx            ← Screen (thin, chỉ compose components)
  ├── SubjectChipBar             ← Horizontal scroll chips
  ├── CameraViewfinder           ← expo-camera wrapper
  ├── CaptureButton              ← Nút chụp + volume button handler
  └── LastPhotoThumbnail         ← Preview ảnh vừa chụp
```

---

## Code Flow (Camera Screen)

```tsx
// 1. Pre-select môn gần nhất
const { lastUsedSubjectId } = usePhotoStore()
const [selectedSubject, setSelectedSubject] = useState(lastUsedSubjectId)

// 2. Chụp ảnh
const handleCapture = async () => {
  if (!selectedSubject) {
    // Nhắc chọn môn, không block
    showToast('Chọn môn học trước nhé!')
    return
  }
  
  const photo = await cameraRef.current?.takePictureAsync({
    quality: PHOTO_QUALITY,  // 0.8
    skipProcessing: false,
  })
  
  if (!photo) return
  
  // 3. Lưu local NGAY (không await upload)
  await savePhotoOffline(photo.uri, selectedSubject)
  
  // 4. Camera sẵn sàng chụp tiếp — không block
  updateLastPhoto(photo.uri)
  updateLastUsedSubject(selectedSubject)
}
```

---

## Permissions

```ts
// Yêu cầu khi app mở lần đầu, không yêu cầu lại mỗi lần
const { status } = await Camera.requestCameraPermissionsAsync()
if (status !== 'granted') {
  // Show màn hình giải thích + nút mở Settings
  // Không crash, không chặn user dùng app
}
```

---

## Edge Cases

| Tình huống | Xử lý |
|:-----------|:------|
| Chưa chọn môn | Toast nhắc nhở, không disable nút chụp |
| Camera không available (emulator) | Show placeholder + message rõ ràng |
| Storage gần đầy | Warning trước khi chụp nếu < 100MB |
| Chụp liên tục nhanh | Queue ảnh, không drop frame |
| App background khi đang chụp | Pause camera, resume khi foreground |
