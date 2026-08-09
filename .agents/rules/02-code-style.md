# Rule 02 — Code Style (TypeScript + React Native + NativeWind)

## TypeScript

```ts
// ✅ Explicit types, không dùng `any`
const uploadPhoto = async (photo: Photo): Promise<void> => { ... }

// ❌
const upload = async (photo: any) => { ... }
```

- Dùng `interface` cho object shapes, `type` cho union/utility types
- Không dùng `as any` — nếu phải cast thì `as unknown as T` + comment lý do
- Optional chaining `?.` và nullish coalescing `??`:

```ts
// ✅
const name = subject?.name ?? 'Không tên'
```

---

## FSD Layer Rules (import chiều xuống, không ngược lên)

```
app/ → screens/ → widgets/ → features/ → entities/ → shared/
```

- `features/` không import lẫn nhau
- `app/` chỉ import từ `screens/`
- Logic dùng chung giữa 2 features → đưa xuống `entities/` hoặc `shared/`

---

## React Native Components

**Cấu trúc file (thứ tự này, không đổi):**
```tsx
// 1. Imports (external → internal)
// 2. Types/Interfaces
// 3. Component function
// 4. Styles (StyleSheet hoặc NativeWind class strings)

import React from 'react'
import { View, Text } from 'react-native'
import { Subject } from '@/types'

interface SubjectChipProps {
  subject: Subject
  selected: boolean
  onPress: () => void
}

export function SubjectChip({ subject, selected, onPress }: SubjectChipProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${selected ? 'opacity-100' : 'opacity-60'}`}
          style={{ backgroundColor: subject.color }}>
      <Text className="text-white text-sm font-medium">{subject.icon} {subject.name}</Text>
    </View>
  )
}
```

**Rules:**
- Dùng **NativeWind** (className) cho layout/spacing/typography — dùng `style={}` chỉ khi cần dynamic values (màu từ data, v.d. `subject.color`)
- Export named, không default export
- Mỗi component 1 file, PascalCase trùng tên file
- Không component quá 150 dòng → tách

---

## Hooks

```ts
// Pattern chuẩn
export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // logic...

  return { subjects, loading, error, refetch }
}
```

- Tên bắt đầu `use`
- Return `{ data, loading, error }` pattern
- Không gọi API trực tiếp trong component → luôn qua hook

---

## File Naming

```
src/shared/ui/atoms/     → PascalCase.tsx    (Button.tsx, Chip.tsx)
src/shared/ui/molecules/ → PascalCase.tsx    (SubjectChip.tsx)
src/entities/subject/    → camelCase.ts      (subjectApi.ts, subject.types.ts)
src/features/*/          → camelCase.ts      (useCapturePhoto.ts)
src/widgets/*/           → PascalCase.tsx    (PhotoGrid.tsx)
src/screens/             → PascalCase.tsx    (CaptureScreen.tsx)
src/store/               → camelCase.ts      (usePhotoStore.ts)
```

---

## Import Aliases

```ts
// ✅ Dùng @/ alias
import { Subject } from '@/types'
import { supabase } from '@/shared/lib/supabase'

// ❌ Không relative dài
import { Subject } from '../../../types'
```

---

## Constants (`src/shared/config/constants.ts`)

```ts
export const COLOR_OPTIONS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
export const ICON_OPTIONS = ['📚', '🔬', '🧮', '🎨', '🏛️', '💻', '🌍', '⚗️']
export const MAX_SUBJECT_NAME_LENGTH = 50
export const PHOTO_QUALITY = 0.8
export const THUMBNAIL_WIDTH = 200
export const SYNC_MAX_RETRIES = 3
```

Không hardcode magic numbers trong component.

---

## Error Handling

```ts
// ✅ Luôn handle, không silent fail
const { data, error } = await supabase.from('subjects').select('id, name, color, icon')
if (error) {
  console.error('[useSubjects]', error.message)
  setError(error.message)
  return
}

// ❌ Silent crash
const { data } = await supabase.from('subjects').select()
setSubjects(data) // crash nếu data null
```
