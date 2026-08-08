# Rule 02 — Code Style (TypeScript + React Native)

## TypeScript

```ts
// ✅ Explicit types, không dùng `any`
const uploadPhoto = async (photo: PhotoAsset): Promise<UploadResult> => { ... }

// ❌ Không làm thế này
const upload = async (photo: any) => { ... }
```

- Luôn dùng `interface` cho object shapes, `type` cho union/utility types
- Không dùng `as any` — nếu cần cast thì dùng `as unknown as T` và ghi comment lý do
- Null safety: dùng optional chaining `?.` và nullish coalescing `??`

```ts
// ✅
const name = subject?.name ?? 'Không tên'

// ❌
const name = subject ? subject.name : 'Không tên'
```

---

## React Native Components

**Component structure (thứ tự này, không đổi):**
```tsx
// 1. Imports (external → internal → styles)
// 2. Types/Interfaces
// 3. Component function
// 4. StyleSheet (cuối file)

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Subject } from '@/types'

interface SubjectCardProps {
  subject: Subject
  onPress: () => void
}

export function SubjectCard({ subject, onPress }: SubjectCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{subject.name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { ... },
  name: { ... },
})
```

**Rules:**
- Dùng `StyleSheet.create()` — không inline style object (re-render tốn kém)
- Export named, không default export (dễ refactor, dễ import)
- Mỗi component một file, đặt tên PascalCase trùng tên file
- Không component quá 150 dòng → tách nhỏ

---

## Hooks

```ts
// ✅ Cấu trúc chuẩn
export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // logic...

  return { subjects, loading, error, refetch }
}
```

- Tên hook bắt đầu bằng `use`
- Luôn return `{ data, loading, error }` pattern
- Không gọi API trực tiếp trong component → luôn qua hook

---

## File Naming

```
components/  → PascalCase.tsx       (SubjectCard.tsx)
hooks/       → camelCase.ts         (useSubjects.ts)
lib/         → camelCase.ts         (supabase.ts, storage.ts)
store/       → camelCase.ts         (usePhotoStore.ts)
types/       → camelCase.ts         (index.ts)
screens/     → PascalCase.tsx       (LibraryScreen.tsx)
```

---

## Import Aliases

Dùng `@/` alias thay vì relative imports dài:
```ts
// ✅
import { Subject } from '@/types'
import { supabase } from '@/lib/supabase'

// ❌
import { Subject } from '../../../types'
```

---

## Error Handling

```ts
// ✅ Luôn handle error, không silent fail
const { data, error } = await supabase.from('subjects').select()
if (error) {
  console.error('[useSubjects]', error.message)
  setError(error.message)
  return
}

// ❌ Không bỏ qua error
const { data } = await supabase.from('subjects').select()
setSubjects(data) // crash nếu data là null
```

---

## Constants

```ts
// src/lib/constants.ts
export const PHOTO_QUALITY = 0.8          // 80% quality cho upload
export const THUMBNAIL_SIZE = 200         // px
export const MAX_BATCH_UPLOAD = 20        // ảnh/lần
export const SYNC_RETRY_ATTEMPTS = 3
```

Không hardcode magic numbers trong component.
