# CRMgreenmouse - Agent Instructions

## Project Overview
CRM SaaS platform (CRMgreenmouse) built with React 19 + Vite. Handles customer management, onboarding, invoicing, and business analytics for tenants.

## Tech Stack
- **Framework:** React 19 (Vite)
- **Routing:** TanStack Router (file-based, `src/routes`)
- **Server State:** TanStack Query (`useQuery`, `useMutation`)
- **Client State:** Jotai (auth, profile), Zustand (onboarding wizard)
- **Styling:** Tailwind CSS 4 + DaisyUI 5
- **Icons:** Lucide React (always `lucide-react`, standard size `size-5` / `20px`)
- **Types:** TypeScript (`strict: true`)
- **Package Manager:** Bun

## Project Structure
```
src/
  client/          # Axios instance + ApiResponse type (api.ts)
  components/      # Shared UI (buttons/, inputs/, modals/, tables/, Headers/)
  helpers/         # Auth hooks (useLogout), image helpers
  routes/          # File-based routes
    __root.tsx     # Root layout (QueryClientProvider, Toaster)
    index.tsx      # Redirects / → /home
    home/          # Landing page + HomeNav component
    auth/
      login/       # Login page with onboarding/profile check
      register/    # Registration page
      verify/      # OTP Email verification page
      on-boarding/ # 9-step onboarding wizard
      forgot-password/ # Password reset request page
        new-password/  # OTP and new password submission page
    tenant/        # Protected dashboard (contacts, accounts, orders, products, users, settings)
  store/
    authStore.ts   # Jotai atoms for User (accessToken, refreshToken) and Profile
    onboarding-store.ts  # Zustand store for wizard state
  stores/          # data.ts (useSearch), client.ts
```

## Key Conventions

### Routing
- Route files: `src/routes/<path>/index.tsx` or `route.tsx` for layouts
- Private route components go in `-components/` subdirectory
- Use `createFileRoute` from `@tanstack/react-router`
- After login, users are checked via `/tenant/auth/me` and redirected to `/auth/register/on-boarding` if `isOnboarded` is false.

### API
- Import: `import apiClient from "@/client/api"`
- Type: `import type { ApiResponse } from "@/client/api"`
- Backend base URL: `https://crmgrenmouse-backend-api.onrender.com/`
- Auth tokens stored in Jotai atom as `accessToken` / `refreshToken` (camelCase)

### Styling
- Primary color: `#007047` (`--color-primary`)
- DaisyUI component classes (`btn`, `btn-primary`, `input`, `select`, `modal`, etc.)
- Glassmorphism + modern green aesthetic
- Rounded cards with `rounded-xl` / `rounded-2xl`

### TypeScript
- `strict: true` in tsconfig
- Unused vars: prefix with `_` (e.g. `_item`) or remove entirely
- Never use `@/api/apiClient` — correct path is `@/client/api`

### Components
- `PageHeader` — title + description + children slot (right side)
- `CustomTable` — generic table with `columnType[]` config
- `SimplePaginator` — page/increment/decrement props
- `PopUp` — action menu for table rows (import `Actions` type from it)
- `DialogModal` — `forwardRef` modal, use `useModal` hook
- `HomeNav` — sticky nav with logo link to `/`, used in register layout

## Onboarding Wizard (`/auth/register/on-boarding/`)
9-step wizard stored in `useOnboardingStore` (Zustand + persist):
1. Industry (icon grid, auto-advances on click)
2. Email
3. Location (state + city)
4. Team size
5. Company website + country
6. **Logo Upload** (via `SelectImage` + `fileApi`)
7. Business type + CAC toggle
8. How did you hear about us (select dropdown)
9. Create account (full name, phone, username — no passwords)

API: `PATCH /tenant/onboarding/` (save progress), `POST /tenant/onboarding/complete` (final step)

## Auth
- Registration: `POST /tenant/auth/register`
- Email Verification: `POST /tenant/auth/verify-email` (OTP)
- Resend OTP: `POST /tenant/auth/resend-otp`
- Forgot Password: `POST /tenant/auth/forgot-password` (Sends OTP)
- Reset Password: `POST /tenant/auth/reset-password` (Requires email, otp, newPassword)
- Login: `POST /tenant/auth/login`
- Profile Check: `GET /tenant/auth/me` (returns `isOnboarded`)
- Logout: `PUT /auth/users/logout`
- Token refresh: `POST /auth/refresh` with `refreshToken` body
- Session stored via `user_atom` (tokens) and `profile_atom` (user info) in Jotai

## Commands
```bash
bun run dev       # Dev server on port 3000
bun run build     # Production build
bun add <pkg>     # Add dependency
```
