# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tedien — dental clinic management software (MVP). Spanish-language UI (es-AR locale for dates).

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run lint      # ESLint
npx prisma db push        # Sync schema to SQLite
npx prisma generate       # Regenerate Prisma client
npx prisma studio         # Visual DB browser
```

## Architecture

- **Framework:** Next.js 16 App Router with React 19, TypeScript (strict)
- **Database:** SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3`. DB file at project root (`dev.db`)
- **UI:** Tailwind CSS v4 + shadcn/ui (base-nova style, neutral color) built on `@base-ui/react` (headless). CVA for variants
- **Icons:** Lucide React
- **Font:** Plus Jakarta Sans (CSS variable `--font-jakarta`)

### Key patterns

- **Server Components** for data-fetching pages. Pages with DB queries use `export const dynamic = "force-dynamic"`
- **Server Actions** in `src/app/actions/` for mutations. Call `revalidatePath()` after writes
- **Prisma singleton** in `src/lib/prisma.ts` with global caching to prevent connection leaks in dev
- **`cn()` utility** in `src/lib/utils.ts` — always use for conditional Tailwind classes
- **Import alias:** `@/*` maps to `src/*`
- shadcn components use `@base-ui/react` (NOT Radix). Use `render` prop instead of `asChild` for composition
- Prisma client imports from `@/generated/prisma/client` (not `@prisma/client`)

### Layout

Root layout (`src/app/layout.tsx`) renders a fixed sidebar + scrollable main content area. All routes are nested inside this shell — no auth layer.

### Data models

Three models in `prisma/schema.prisma`: **Patient** (firstName, lastName, dni, phone, email, lastVisit, notes), **Professional** (firstName, lastName, dni, specialty, licenseNumber, phone, email, color), and **Appointment** (date, reason, status, patientId, professionalId). Patient.dni and Professional.dni are unique. Zod is used for Professional validation.
