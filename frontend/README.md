# 📱 StudySnap Mobile App (Frontend)

Ứng dụng React Native + Expo cho StudySnap — Chụp & Phân loại ảnh bài giảng.

## Tech Stack
- **Framework:** React Native + Expo (v52) + TypeScript
- **Navigation:** Expo Router
- **Backend / Database:** Supabase JS Client (`@supabase/supabase-js`)
- **State Management:** Zustand (với AsyncStorage persistence)
- **Styling:** NativeWind (Tailwind CSS cho React Native)

## Thư mục Source (`src/`)
- `components/` — Các UI components reusable (Modal, Buttons, Input,...)
- `hooks/` — Custom React Hooks (`useSubjects`,...)
- `lib/` — Helper services, Supabase client initialization, constants
- `types/` — TypeScript interfaces & types (`Subject`, `Photo`, `CreateSubjectInput`,...)

## Hướng dẫn chạy

```bash
# Cài đặt dependencies
npm install

# Khởi chạy Expo Dev Server
npm start

# Running on Android / iOS
npm run android
npm run ios
```

## Biến môi trường (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
