# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tedien — dental clinic management software (MVP). Spanish-language UI (es-AR locale for dates).

## Setup local

1. Crear `.env` en la raíz con `DATABASE_URL="file:./dev.db"`
2. `npx prisma generate` — regenera el cliente
3. `npx prisma migrate dev --name init_local` — crea `dev.db` y las tablas
   - La URL la lee `prisma.config.ts` (via `dotenv`); el `datasource` en `schema.prisma` no lleva `url`

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run lint      # ESLint
npx prisma db push        # Sync schema to SQLite (sin historial de migraciones)
npx prisma generate       # Regenerate Prisma client
npx prisma migrate dev    # Crear y aplicar migración
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

### Odontogram

Interactive SVG dental chart in `src/components/odontogram/`. Uses FDI numbering, 5 faces per tooth (polygon-based), tooth-level overlays (extraction, absent, crown), and prosthesis grouping. Built with `@base-ui/react/popover` for tooth popovers. Integrated into patient page via `OdontogramSection` — saved once per clinical history (`odontogramData` JSON field), then read-only.

### Data models

Models in `prisma/schema.prisma`:

- **Patient** (firstName, lastName, dni, phone, email, lastVisit, notes) — `dni` unique
- **Professional** (firstName, lastName, dni, specialtyId, licenseNumber, phone, email, color) — `dni` unique
- **Specialty** (name) — `name` unique, related to Professional
- **Appointment** (date, reason, status, patientId, professionalId) — optional link to Evolution
- **ClinicalHistory** (patientId, bloodType, chronicDiseases, generalNotes, allergies, currentMedications, initialized, odontogramData) — one per patient, `odontogramData` stores JSON odontogram state (write-once)
- **Evolution** (historyId, professionalId, treatment, description, tooth, face, appointmentId) — clinical notes linked to history
- **Category** (name) — `name` unique, for inventory products
- **Product** (name, stock, minStock, unit, expirationDate, categoryId) — inventory items
- **ProductMovement** (productId, type, quantity, reason, appointmentId, patientId, professionalId) — stock movement log

Zod is used for Professional validation.

### Zod + email validation (Zod v4)

Zod v4 está instalado. `.optional()` solo acepta `undefined`, no `""`. Para campos de email opcionales usar:
```ts
email: z.string().refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalido").optional()
```
La regex custom es necesaria porque `.email()` de Zod v4 rechaza caracteres Unicode (ñ, tildes, etc.).
