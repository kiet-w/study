# Flow: Camera Capture (`features/capture-photo`)

> Nguồn sự thật: `docs/01-mobile-app/phase-1-capture-categorize.md`

## UX Target: ≤ 2 chạm từ mở app đến ảnh được lưu

**Flow đã chốt: Chọn môn TRƯỚC → Bấm chụp**  
(Lý do: đang nghe giảng, tốc độ quan trọng hơn linh hoạt)

---

## User Flow

```
Tab Capture mở ra
      ↓
[Dải chip môn học cuộn ngang phía dưới]
  → Màu chip = màu môn (nhận diện bằng màu, không cần đọc)
  → Môn dùng gần nhất được pre-select tự động (giảm 1 thao tác)
      ↓
[Viewfinder camera chiếm phần lớn màn hình]
      ↓
User tap chụp (hoặc volume button)
      ↓
[Lưu local NGAY - không block]  ← Rule 04: offline-first
      ↓
[Sẵn sàng chụp tiếp NGAY]
  → Thumbnail nhỏ góc dưới phải (tap → xem chi tiết)
  → Badge sync status (⏳ pending / ✅ synced)
```

---

## FSD Placement

```
src/features/capture-photo/
  useCapturePhoto.ts      ← logic: chụp, lưu local, add queue
src/widgets/capture-flow/
  CaptureFlow.tsx         ← ghép SubjectChipBar + CameraViewfinder + CaptureButton
src/shared/ui/molecules/
  SubjectChip.tsx         ← Chip màu cho 1 môn
app/(tabs)/capture.tsx    ← thin wrapper → <CaptureScreen />
src/screens/
  CaptureScreen.tsx       ← import CaptureFlow widget
```

---

## Code Flow

```tsx
// src/features/capture-photo/useCapturePhoto.ts
export function useCapturePhoto() {
  const { addToQueue, lastSubjectId } = usePhotoStore()
  const [selectedSubjectId, setSelectedSubjectId] = useState(lastSubjectId)

  const capture = async (cameraRef: RefObject<Camera>) => {
    if (!selectedSubjectId) {
      // Nhắc chọn môn — không block
      Alert.alert('Chọn môn học trước nhé!')
      return
    }

    const photo = await cameraRef.current?.takePictureAsync({
      quality: PHOTO_QUALITY,   // 0.8
      skipProcessing: false,
    })
    if (!photo) return

    // Lưu local + add queue — KHÔNG await upload
    const photoId = uuid()
    const localPath = await savePhotoLocal(photo.uri, photoId)

    addToQueue({
      id: photoId,
      localPath,
      subjectId: selectedSubjectId,
      takenAt: new Date(),
      synced: false,
    })
  }

  return { capture, selectedSubjectId, setSelectedSubjectId }
}
```

---

## Permissions

```ts
// Xin 1 lần khi app mở lần đầu
const { status } = await Camera.requestCameraPermissionsAsync()
if (status !== 'granted') {
  // Show màn hình giải thích + nút mở Settings — không crash app
}
```

---

## Edge Cases

| Tình huống | Xử lý |
|:-----------|:------|
| Chưa chọn môn | Alert nhắc, không disable nút chụp |
| Camera không có (emulator) | Placeholder + message rõ |
| Storage gần đầy | Warning trước khi chụp nếu < 100MB |
| Chụp liên tiếp nhanh | Queue ảnh, không drop |
| App vào background | Pause camera, resume khi foreground |
