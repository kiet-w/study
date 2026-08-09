# Flow: Create Subject (Tạo Môn Học)

> Layered architecture: Client → Router → Controller → Service → Repository (Supabase)

## 1. Sơ đồ luồng

```
[UI Component]                → gọi hook
  ↓
[useSubjects hook]            → gọi service
  ↓
[subjectService.create()]     → gọi repository
  ↓
[subjectRepository.insert()]  → gọi Supabase
  ↓
[Supabase DB]                 → INSERT INTO subjects
  ↑
  └─ trả về inserted row → hook cập nhật state → UI re-render
```

---

## 2. Các file liên quan

```
src/
├── types/index.ts                    ← Subject interface
├── lib/subjectRepository.ts          ← Supabase query (tầng DB)
├── lib/subjectService.ts             ← Business logic (validate, etc.)
├── hooks/useSubjects.ts              ← React state + gọi service
└── components/CreateSubjectModal.tsx ← UI (form nhập tên, chọn màu/icon)
```

---

## 3. Layer-by-layer implementation

### Layer 1: Types (`src/types/index.ts`)

```ts
export interface Subject {
  id: string
  user_id: string
  name: string
  color: string   // hex, VD: "#3B82F6"
  icon: string    // emoji, VD: "📚"
  created_at: string
}

export interface CreateSubjectInput {
  name: string
  color: string
  icon: string
}
```

---

### Layer 2: Repository (`src/lib/subjectRepository.ts`)

> **Nhiệm vụ:** Chỉ nói chuyện với Supabase. Không có logic nghiệp vụ ở đây.

```ts
import { supabase } from '@/lib/supabase'
import { Subject, CreateSubjectInput } from '@/types'

export const subjectRepository = {
  async create(userId: string, input: CreateSubjectInput): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color,
        icon: input.icon,
      })
      .select('id, user_id, name, color, icon, created_at')
      .single()

    if (error) throw error
    return data
  },
}
```

---

### Layer 3: Service (`src/lib/subjectService.ts`)

> **Nhiệm vụ:** Validate input, business rules. Không biết về UI, không biết về Supabase trực tiếp.

```ts
import { subjectRepository } from '@/lib/subjectRepository'
import { CreateSubjectInput, Subject } from '@/types'

const MAX_NAME_LENGTH = 50
const VALID_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export const subjectService = {
  async create(userId: string, input: CreateSubjectInput): Promise<Subject> {
    // Validate
    const name = input.name.trim()
    if (!name) throw new Error('Tên môn học không được để trống')
    if (name.length > MAX_NAME_LENGTH) throw new Error(`Tên không quá ${MAX_NAME_LENGTH} ký tự`)
    if (!input.color) throw new Error('Vui lòng chọn màu cho môn học')
    if (!input.icon) throw new Error('Vui lòng chọn icon cho môn học')

    // Gọi repository
    return subjectRepository.create(userId, { ...input, name })
  },
}
```

---

### Layer 4: Hook (`src/hooks/useSubjects.ts`)

> **Nhiệm vụ:** Quản lý React state, gọi service, expose cho UI.

```ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { subjectService } from '@/lib/subjectService'
import { Subject, CreateSubjectInput } from '@/types'

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tất cả subjects của user
  useEffect(() => {
    fetchSubjects()
  }, [])

  async function fetchSubjects() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Chưa đăng nhập'); setLoading(false); return }

    const { data, error: fetchError } = await supabase
      .from('subjects')
      .select('id, user_id, name, color, icon, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[useSubjects] fetch', fetchError.message)
      setError(fetchError.message)
    } else {
      setSubjects(data ?? [])
    }
    setLoading(false)
  }

  // ─── CREATE ───────────────────────────────────────────────
  async function createSubject(input: CreateSubjectInput): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Chưa đăng nhập'); return }

    try {
      const newSubject = await subjectService.create(user.id, input)
      // Optimistic update — thêm vào đầu danh sách
      setSubjects(prev => [newSubject, ...prev])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo môn học thất bại'
      console.error('[useSubjects] create', message)
      setError(message)
      throw err  // re-throw để UI có thể xử lý (hiện toast, v.v.)
    }
  }

  return { subjects, loading, error, createSubject, refetch: fetchSubjects }
}
```

---

### Layer 5: UI Component (`src/components/CreateSubjectModal.tsx`)

> **Nhiệm vụ:** Chỉ render UI và gọi hook. Không biết về Supabase.

```tsx
import React, { useState } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native'
import { useSubjects } from '@/hooks/useSubjects'

interface CreateSubjectModalProps {
  visible: boolean
  onClose: () => void
}

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899',
]
const ICON_OPTIONS = ['📚', '🔬', '🧮', '🎨', '🏛️', '💻', '🌍', '⚗️']

export function CreateSubjectModal({ visible, onClose }: CreateSubjectModalProps) {
  const { createSubject } = useSubjects()

  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      await createSubject({ name, color: selectedColor, icon: selectedIcon })
      // Reset form và đóng modal khi thành công
      setName('')
      setSelectedColor(COLOR_OPTIONS[0])
      setSelectedIcon(ICON_OPTIONS[0])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Tạo môn học mới</Text>

          {/* Tên môn */}
          <TextInput
            style={styles.input}
            placeholder="VD: Vật lý đại cương"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          {/* Chọn màu */}
          <Text style={styles.label}>Màu sắc</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorDot, { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          {/* Chọn icon */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconBtn, selectedIcon === icon && styles.iconBtnSelected]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: selectedColor }]}
              onPress={handleSubmit}
              disabled={submitting || !name.trim()}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitText}>Tạo môn {selectedIcon}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#111' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: '#111' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  iconBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  iconBtnSelected: { borderColor: '#111', backgroundColor: '#F3F4F6' },
  iconText: { fontSize: 22 },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  submitBtn: { flex: 2, padding: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { fontSize: 15, color: '#fff', fontWeight: '700' },
})
```

---

## 4. Cách dùng trong Screen

```tsx
// app/(tabs)/index.tsx hoặc bất kỳ screen nào
import { useState } from 'react'
import { Button } from 'react-native'
import { CreateSubjectModal } from '@/components/CreateSubjectModal'

export default function HomeScreen() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      {/* ... nội dung screen ... */}
      <Button title="+ Thêm môn" onPress={() => setShowCreate(true)} />
      <CreateSubjectModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  )
}
```

---

## 5. Checklist trước khi code

- [ ] `subjects` table đã có trong Supabase + RLS policy bật
- [ ] `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_ANON_KEY` đã set trong `.env`
- [ ] `@/` alias đã config trong `tsconfig.json`
- [ ] User đã đăng nhập (auth guard trong `app/_layout.tsx`)
