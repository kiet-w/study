# Flow: Auth (Supabase)

> Nguồn sự thật: `docs/02-backend-supabase/storage-and-auth.md`

## Providers Đã Bật

- **Email** (Magic Link hoặc password)
- **Google** OAuth

---

## Screen Flow

```
App start
    ↓
[Check session]
    ├─ có session → (tabs)/
    └─ không → (auth)/login

(auth)/login
    ├─ [Google] → OAuth redirect → studysnap://auth-callback → (tabs)/
    └─ [Email]  → Magic Link email → (tabs)/

(tabs)/ → [Logout] → clear session → (auth)/login
```

---

## FSD Placement

```
app/_layout.tsx              ← 🔴 CRITICAL: root auth guard
src/store/useAuthStore.ts    ← 🔴 CRITICAL: session state
src/features/auth/           ← login logic (nếu cần tách)
app/(auth)/login.tsx         ← Login screen (thin wrapper)
```

---

## Root Auth Guard (`app/_layout.tsx`)

```tsx
// 🔴 CRITICAL — không sửa structure này
export default function RootLayout() {
  const { session, loading } = useAuthStore()

  if (loading) return <SplashScreen />

  return (
    <Stack>
      {session ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  )
}
```

---

## Supabase Client Config (với `expo-secure-store`)

```ts
// src/shared/lib/supabase.ts — 🔴 CRITICAL, đã có sẵn
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,   // ← an toàn hơn AsyncStorage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,         // false cho React Native
    },
  }
)
```

---

## Google OAuth

```ts
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

// Deep link redirect về app
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'studysnap://auth-callback',
    },
  })
}
```

---

## Email Magic Link

```ts
const handleEmailLogin = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: 'studysnap://auth-callback' },
  })
  if (error) showError(error.message)
  else showSuccess('Kiểm tra email của bạn!')
}
```

---

## Auth Store

```ts
// src/store/useAuthStore.ts — 🔴 CRITICAL
interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  initialize: () => Promise<void>   // gọi 1 lần khi app start
  signOut: () => Promise<void>
}
```

---

## Không Cần

- Bảng `users` riêng — dùng `auth.users` của Supabase, chỉ cần `user_id = auth.uid()` trong các bảng khác
- Tự implement refresh token — Supabase + SecureStore xử lý tự động
