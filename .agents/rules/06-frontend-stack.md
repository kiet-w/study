# Rule 06 — Frontend Tech Stack (React Native + Expo)

> Đọc khi: setup project, thêm dependency, không biết dùng thư viện nào.  
> Nguồn sự thật chi tiết hơn: `docs/01-mobile-app/tech-stack.md`

---

## Package Manager

```bash
npm install                    # dependencies thông thường
npx expo install <package>     # Expo-managed packages — tránh version conflict
```

---

## Core Stack

```json
{
  "expo": "~52.x",
  "react": "18.x",
  "react-native": "0.76.x"
}
```

---

## Packages Đã Chọn (từ `docs/01-mobile-app/tech-stack.md`)

| Nhu cầu | Package | Ghi chú |
|:--------|:--------|:--------|
| Camera | `expo-camera` | Chụp trực tiếp trong app |
| Chọn ảnh từ album | `expo-image-picker` | Fallback khi không chụp trực tiếp |
| Navigation | `expo-router` | File-based, giống Next.js App Router |
| Styling | **`nativewind`** | Tailwind syntax cho RN |
| State management | `zustand` | + AsyncStorage để persist |
| Supabase client | `@supabase/supabase-js` | |
| Local cache ảnh | `expo-file-system` | Lưu trước khi upload — offline-first |
| Background upload | `expo-task-manager` + `expo-background-fetch` | Upload khi app chạy nền |
| Nén ảnh | `expo-image-manipulator` | Resize + compress thumbnail |
| Lưu session | `expo-secure-store` | An toàn hơn AsyncStorage |
| Network status | `@react-native-community/netinfo` | Detect có mạng để trigger sync |

---

## Routing (Expo Router)

```
app/
├── _layout.tsx          ← Root layout + auth guard (🔴 CRITICAL)
├── (auth)/
│   └── login.tsx
└── (tabs)/
    ├── _layout.tsx      ← Tab navigator
    ├── capture.tsx      ← Camera screen (thin wrapper → CaptureScreen)
    ├── library.tsx      ← Thư viện (thin wrapper → LibraryScreen)
    └── subjects.tsx     ← Quản lý môn (thin wrapper → SubjectsScreen)
```

**Quan trọng:** File trong `app/` chỉ là thin wrapper — import từ `src/screens/`, không viết logic ở đây.

---

## Styling — NativeWind

```tsx
// ✅ NativeWind cho layout, spacing, typography
<View className="flex-1 px-4 py-2 bg-white">
  <Text className="text-lg font-semibold text-gray-900">{subject.name}</Text>
</View>

// ✅ Dùng style={{ }} cho dynamic values từ data
<View className="rounded-full px-3 py-1"
      style={{ backgroundColor: subject.color }}>
```

Không dùng `StyleSheet.create()` nữa — dùng NativeWind làm primary styling.

---

## State Management — Zustand

```ts
// src/store/usePhotoStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const usePhotoStore = create(
  persist(
    (set, get) => ({
      queue: [] as Photo[],
      addToQueue: (photo: Photo) => set(s => ({ queue: [...s.queue, photo] })),
      markSynced: (id: string) => set(s => ({
        queue: s.queue.map(p => p.id === id ? { ...p, synced: true } : p)
      })),
    }),
    { name: 'photo-store', storage: createJSONStorage(() => AsyncStorage) }
  )
)
```

---

## Icons

```tsx
// Đã bundle với Expo — không install thêm icon library
import { Ionicons } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
```

---

## Environment Variables

```env
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Không đặt sensitive keys với EXPO_PUBLIC_ prefix
```

---

## `app.json` Tối Thiểu

```json
{
  "expo": {
    "name": "StudySnap",
    "slug": "studysnap",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "studysnap",
    "android": {
      "package": "com.kietw.studysnap"
    },
    "plugins": [
      "expo-router",
      ["expo-camera", {
        "cameraPermission": "StudySnap cần quyền camera để chụp bài giảng"
      }]
    ]
  }
}
```

---

## Build

```bash
# Dev
npx expo start

# APK test
eas build -p android --profile preview

# Production
eas build -p android --profile production
```

---

## KHÔNG Dùng (Đã Chốt)

| Thứ | Thay bằng | Lý do |
|:----|:----------|:------|
| StyleSheet.create() | NativeWind | Đã chọn NativeWind làm primary styling |
| Redux | Zustand | Quá verbose |
| React Navigation thủ công | Expo Router | File-based = ít config hơn |
| NativeBase / React Native Paper | NativeWind + tự build | Quá nặng |
| Yarn / Bun | npm | Nhất quán với Expo toolchain |
| Kotlin / Java | React Native + Expo | Tận dụng React đã biết |
| Supabase Realtime (Phase 1) | Không dùng — để dành Phase 3 | YAGNI |
| AI SDK (Phase 1) | Không dùng — để dành Phase 4 | YAGNI |
