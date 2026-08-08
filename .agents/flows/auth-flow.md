# Flow: Auth (Supabase)

> Login/logout flow — Email + Google OAuth.

## Screen Flow

```
App khởi động
      ↓
[Kiểm tra session hiện tại]
      ├─ Có session valid → (tabs)/  (home)
      └─ Không có session → (auth)/login
      
(auth)/login
  ├─ [Login Google]  → OAuth redirect → callback → (tabs)/
  └─ [Login Email]   → Magic Link email → (tabs)/
  
(tabs)/
  └─ [Logout] → clear session → (auth)/login
```

---

## Root Layout (Auth Guard)

```tsx
// app/_layout.tsx — CRITICAL FILE, không tự ý sửa
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

## Auth Store

```ts
// src/store/useAuthStore.ts — CRITICAL FILE
interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  
  initialize: () => Promise<void>   // gọi 1 lần khi app start
  signOut: () => Promise<void>
}
```

---

## Google OAuth Setup

```ts
// Cần config trong Supabase Dashboard:
// Authentication → Providers → Google → Enable
// Redirect URL: exp://localhost:8081 (dev) + production URL

import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'

WebBrowser.maybeCompleteAuthSession()

// Trong component Login:
const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
})

useEffect(() => {
  if (response?.type === 'success') {
    const { id_token } = response.params
    supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    })
  }
}, [response])
```

---

## Magic Link (Email)

```ts
// Đơn giản hơn Google, dùng cho users không có Google
const handleEmailLogin = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'studysnap://auth/callback', // deep link
    },
  })
  if (error) showError(error.message)
  else showSuccess('Kiểm tra email của bạn!')
}
```

---

## Session Persistence

Supabase tự handle refresh token qua `AsyncStorage`. Không cần tự implement.

```ts
// src/lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(URL, KEY, {
  auth: {
    storage: AsyncStorage,       // ← auto persist session
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,   // false cho React Native
  },
})
```

---

## User Data

```ts
// Sau khi auth thành công, sync user profile
// Không cần bảng users riêng — dùng auth.users của Supabase
// Chỉ cần user_id (= auth.uid()) trong các bảng khác
```
