# CRMgreenmouse - Project Instructions

## Tech Stack
- **Framework:** React 19 (Vite)
- **Routing:** TanStack Router (File-based routing in `src/routes`)
- **State Management:** TanStack Query (Server state), Jotai / Zustand (Client state)
- **Styling:** Tailwind CSS 4 + DaisyUI 5
- **Icons:** Lucide React
- **Types:** TypeScript

## Architecture & Conventions
- **Routing:** Routes are located in `src/routes`. Components specific to a route should be in a `-components` subdirectory within that route's folder.
- **Components:** Shared components reside in `src/components`, organized by type (buttons, forms, inputs, etc.).
- **Styling:** 
  - Follow the established glassmorphism and modern aesthetic.
  - Primary color: `#007047` (configured as `--color-primary` in `src/index.css`).
  - Use DaisyUI classes (`btn`, `btn-primary`, etc.) combined with Tailwind 4 utilities.
- **Icons:** Always use `lucide-react`. Standard icon size is `size-5` (or `20px`).
- **Data Fetching:** Use TanStack Query hooks. API definitions are in `src/client/`.

## Development Workflow
- **Package Manager:** Bun (Always use `bun` for installing dependencies and running scripts)
- **Commands:**
  - `bun run dev`: Start development server on port 3000.
  - `bun run build`: Build for production.
  - `bun run test`: Run Vitest tests.
  - `bun add <package>`: Add new dependencies.
