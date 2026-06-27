# Bug Fixes & Cleanup Guide

## 1. Fix Notification Bug: `isRead` → `read`

### Issue
The frontend mistakenly sets both `read` and `isRead` fields on notifications. The backend only sends `read` (Boolean), but the frontend creates `isRead` as a duplicate field.

**Files to fix:**
- `app/CONTEXT/NotificationContext.jsx` (lines 80, 91, 194)
- Any components reading `notification.isRead`

### Solution

#### Step 1: Update NotificationContext.jsx

**BEFORE (Line 80):**
```javascript
prev.map((n) => n.id === id ? { ...n, read: true, isRead: true } : n)
```

**AFTER:**
```javascript
prev.map((n) => n.id === id ? { ...n, read: true } : n)
```

**BEFORE (Line 91):**
```javascript
setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
```

**AFTER:**
```javascript
setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
```

**BEFORE (Line 194):**
```javascript
const normalized = {
  id:        data.id        ?? Date.now(),
  title:     data.title     ?? data.message ?? "New notification",
  message:   data.message   ?? data.content ?? "",
  type:      data.type      ?? "system",
  read:      false,
  isRead:    false,  // ❌ REMOVE THIS LINE
  createdAt: data.createdAt ?? new Date().toISOString(),
  link:      data.link      ?? null,
  metadata:  data.metadata  ?? null,
};
```

**AFTER:**
```javascript
const normalized = {
  id:        data.id        ?? Date.now(),
  title:     data.title     ?? data.message ?? "New notification",
  message:   data.message   ?? data.content ?? "",
  type:      data.type      ?? "system",
  read:      false,
  createdAt: data.createdAt ?? new Date().toISOString(),
  link:      data.link      ?? null,
  metadata:  data.metadata  ?? null,
};
```

#### Step 2: Update all components reading notifications

**Search for:**
```javascript
notification.isRead
```

**Replace with:**
```javascript
notification.read
```

**Files to check:**
- `app/components/notification/*`
- `app/components/shared/*`
- Any page using notifications

---

## 2. Remove localStorage Token Usage

### Issue
The frontend stores authentication tokens in localStorage, which is vulnerable to XSS attacks. All auth should be cookie-based.

**Files to fix:**
- `app/CONTEXT/AuthProvider.js`
- `services/api.js`
- Any other files using `localStorage.getItem("token")`

### Solution

#### Step 1: Update AuthProvider.js

**REMOVE these lines (21-24):**
```javascript
// ❌ DO NOT DO THIS
useEffect(() => {
  const saved = localStorage.getItem("token");
  if (saved) setToken(saved);
}, []);
```

**REMOVE these lines (82-84):**
```javascript
// ❌ DO NOT DO THIS
localStorage.setItem("token",  newToken);
localStorage.setItem("userId", userData.id);
```

**REMOVE these lines (114-115):**
```javascript
// ❌ DO NOT DO THIS
localStorage.removeItem("token");
localStorage.removeItem("userId");
```

**Replace with the new AuthProvider from `app/providers/AuthProvider.jsx`**

#### Step 2: Update services/api.js

**BEFORE:**
```javascript
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

**AFTER:**
```javascript
// ❌ REMOVE THIS FILE ENTIRELY
// Use lib/apiClient.js instead, which handles cookies automatically
```

#### Step 3: Search and remove all localStorage token usage

```bash
grep -r "localStorage.getItem.*token" app/
grep -r "localStorage.setItem.*token" app/
grep -r "localStorage.removeItem.*token" app/
```

Replace all instances with cookie-based auth (handled by middleware + server).

---

## 3. Remove nodemailer from package.json

### Issue
`nodemailer` is a server-side email library and has no place in a frontend application.

### Solution

**In `package.json`, remove:**
```json
"nodemailer": "^8.0.1"
```

**Then run:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## 4. Clean Up Unused React Server DOM Packages

### Issue
The frontend includes multiple React Server DOM packages that are unnecessary:
- `react-server-dom-parcel`
- `react-server-dom-turbopack`
- `react-server-dom-webpack`

These are for server-side rendering and should not be in a client-side Next.js app.

### Solution

**In `package.json`, remove:**
```json
"react-server-dom-parcel": "^19.2.3",
"react-server-dom-turbopack": "^19.2.3",
"react-server-dom-webpack": "^19.2.3",
```

**Then run:**
```bash
npm install
```

---

## 5. Update Layout.js to Use New Providers

### Issue
The current layout uses old Context Providers that need to be replaced.

### Solution

**Replace `app/layout.js` with:**

```javascript
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import { QueryClientProviderWrapper } from "./providers/QueryClientProvider";
import { AuthProvider } from "./providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Guidfy - Learning Paths Platform",
  description: "Curated learning paths for professional development",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProviderWrapper>
          <AuthProvider>
            <ToastContainer />
            <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
```

---

## 6. Migration Checklist

- [ ] Install new dependencies: `zustand`, `@tanstack/react-query`
- [ ] Remove `nodemailer` from package.json
- [ ] Remove unused React Server DOM packages
- [ ] Copy new files from refactored code:
  - [ ] `lib/apiClient.js`
  - [ ] `lib/stores/uiStore.js`
  - [ ] `lib/stores/authStore.js`
  - [ ] `lib/queryClient.js`
  - [ ] `app/providers/QueryClientProvider.jsx`
  - [ ] `app/providers/AuthProvider.jsx`
  - [ ] `middleware.ts`
  - [ ] All custom hooks in `app/hooks/`
- [ ] Update `app/layout.js` to use new providers
- [ ] Fix notification `isRead` → `read` bug
- [ ] Remove all `localStorage.getItem("token")` usage
- [ ] Delete old Context files (after migration):
  - [ ] `app/CONTEXT/AuthProvider.js`
  - [ ] `app/CONTEXT/NotificationContext.jsx`
  - [ ] Other unused Context files
- [ ] Update components to use new custom hooks
- [ ] Test authentication flow
- [ ] Test notifications
- [ ] Test API requests

---

## 7. Testing Checklist

### Authentication
- [ ] Login works and sets HttpOnly cookie
- [ ] Logout clears cookie
- [ ] Protected routes redirect to /login when not authenticated
- [ ] User data loads correctly after login

### Notifications
- [ ] Notifications load correctly
- [ ] `read` field is used (not `isRead`)
- [ ] Mark as read works
- [ ] Real-time notifications arrive via WebSocket

### API Requests
- [ ] All requests include credentials (cookies)
- [ ] No Bearer tokens in headers
- [ ] 401 errors trigger token refresh
- [ ] 401 errors redirect to login after refresh fails

### Performance
- [ ] Data is cached correctly
- [ ] Refetching works on window focus
- [ ] Pagination works
- [ ] Search/filters work

---

## 8. Deployment Notes

### Environment Variables
Create `.env.local` (never commit to git):
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

### Backend Requirements
The backend MUST:
1. Set HttpOnly, Secure, SameSite cookies for auth tokens
2. Support CORS with `credentials: 'include'`
3. Implement token refresh endpoint at `POST /auth/refresh`
4. Return `read` (not `isRead`) in notification objects

### Security Checklist
- [ ] All API requests use HTTPS in production
- [ ] Cookies are HttpOnly and Secure
- [ ] CORS is properly configured
- [ ] CSP headers are set
- [ ] No sensitive data in localStorage
- [ ] No tokens in URL or headers
