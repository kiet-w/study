# Rule 06 — Frontend Tech Stack (React Native + Expo)

> Đọc file này khi: setup project mới, thêm dependency, hoặc không chắc dùng thư viện nào.

---

## Package Manager

```bash
# Dùng npm (không dùng yarn hay bun — nhất quán với Expo toolchain)
npm install
npx expo install <package>   # ← Dùng cho Expo-managed packages để tránh version conflict
```

---

## Core Dependencies (Phase 1)

### Framework
```json
{
  "expo": "~52.x",
  "react": "18.x",
  "react-native": "0.76.x"
}
```

### Routing
```bash
npx expo install expo-router
```
```
app/
├── _layout.tsx          ← Root layout (Stack navigator)
├── (auth)/
│   ├── _layout.tsx
│   └── login.tsx
└── (tabs)/
    ├── _layout.tsx      ← Tab navigator
    ├── index.tsx        ← Home / Library
    ├── camera.tsx       ← Camera screen
    └── subjects.tsx     ← Subject management
```
- Dùng **Expo Router** (file-based routing), không dùng React Navigation thủ công
- Route groups `(auth)`, `(tabs)` dùng để nhóm layout, không ảnh hưởng URL

### Camera
```bash
npx expo install expo-camera expo-media-library
```
- `expo-camera` — capture ảnh trong app
- `expo-media-library` — KHÔNG dùng để lưu (tránh lẫn album). Chỉ dùng nếu cần import từ album
- Config `app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-camera", { "cameraPermission": "StudySnap cần camera để chụp bài giảng" }]
    ]
  }
}
```

### File System (Local Cache — Offline-first)
```bash
npx expo install expo-file-system expo-image-manipulator
```
- `expo-file-system` — lưu ảnh local trước khi upload
- `expo-image-manipulator` — tạo thumbnail (resize + compress)

### State Management
```bash
npm install zustand
npm install @react-native-async-storage/async-storage  # persist store
npm install zustand-middleware-mmkv  # hoặc dùng AsyncStorage là đủ
```
- **Zustand** — không Redux, không Context API cho global state
- Persist store qua app restart bằng AsyncStorage

```ts
// Pattern chuẩn cho Zustand store
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const usePhotoStore = create(
  persist(
    (set, get) => ({ ... }),
    { name: 'photo-store', storage: createJSONStorage(() => AsyncStorage) }
  )
)
```

### Supabase Client
```bash
npm install @supabase/supabase-js
npx expo install expo-secure-store  # lưu token an toàn
```

### Network Detection (Offline-first)
```bash
npx expo install @react-native-community/netinfo
```

### UI Components
```bash
# KHÔNG dùng UI library nặng (NativeBase, React Native Paper)
# Tự build với StyleSheet — đơn giản hơn, ít bug hơn
# Chỉ add nếu thật sự cần:
npx expo install expo-linear-gradient   # gradient backgrounds
npm install react-native-reanimated     # animations (đã có sẵn với Expo)
npm install react-native-gesture-handler # gestures (đã có với Expo Router)
```

### Icons
```bash
# Expo đã bundle @expo/vector-icons — KHÔNG install thêm icon library
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
```

---

## Dev Dependencies

```bash
npm install -D typescript @types/react @types/react-native
```

---

## Build & Deploy

```bash
# Dev (Expo Go app)
npx expo start

# Build APK Android (test)
eas build -p android --profile preview

# Build APK Android (production)
eas build -p android --profile production
```

### `eas.json` config
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## Environment Variables

```bash
# .env (Expo dùng prefix EXPO_PUBLIC_ cho client-side vars)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Không được đặt sensitive keys với prefix EXPO_PUBLIC_
# Server-only secrets → chỉ dùng trong EAS Secrets hoặc backend
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
      "package": "com.kietw.studysnap",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#ffffff"
      }
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

## KHÔNG Dùng (Đã Quyết Định)

| Thứ | Thay bằng | Lý do |
|:----|:----------|:------|
| Redux / Redux Toolkit | Zustand | Quá verbose |
| React Navigation (manual) | Expo Router | File-based = ít config hơn |
| NativeBase / RN Paper | StyleSheet tự viết | Quá nặng, nhiều bug |
| Yarn / Bun | npm | Nhất quán với Expo toolchain |
| Kotlin / Java | React Native | Tận dụng React đã biết |
| `expo-image-picker` để save | `expo-file-system` | Không lưu vào album điện thoại |
