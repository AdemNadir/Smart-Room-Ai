# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Smart Room Frontend** — A university classroom management platform built with React 19, TypeScript, Vite, and React Router 8. The frontend consumes a mocked API layer that will be replaced by a real backend.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build**: Vite 8
- **Routing**: React Router 8 (declarative routes in App.tsx)
- **Styling**: CSS Modules with CSS Custom Properties (design tokens)
- **Fonts**: Figtree Variable (Latin) + IBM Plex Sans Arabic (Arabic/RTL)
- **Icons**: lucide-react
- **Mock API**: In `src/api/mock/` — replaced by real API without UI changes

## Key Commands

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture

### Directory Structure

```
src/
├── api/              # API layer (mocked, swappable)
│   ├── index.ts      # Public API surface
│   ├── types.ts      # Domain types (Role, User)
│   └── mock/         # Demo implementations
├── auth/             # Authentication context & guards
│   ├── AuthContext.tsx
│   └── guards.tsx    # RequireAuth, RequireRole, homeFor()
├── components/
│   ├── ui/           # Reusable primitives (Button, Surface, Field, StatusPill, Logo)
│   ├── ComingNext.tsx
│   └── PageHeader.tsx
├── layout/
│   └── AppShell.tsx  # Signed-in chrome: topbar, nav, user menu
├── pages/
│   ├── LoginPage.tsx
│   ├── SearchPage.tsx        # Professor home (role: professor, admin)
│   ├── BookingsPage.tsx      # Professor bookings (role: professor)
│   ├── AdminPage.tsx         # Admin dashboard (role: admin)
│   └── NotFoundPage.tsx
├── styles/
│   ├── tokens.css    # Design tokens (colors, spacing, type, motion)
│   └── base.css      # Global reset, reduced-motion, RTL-ready
├── lib/
│   ├── cx.ts         # Class name utility
│   └── useDocumentTitle.ts
├── App.tsx           # Routes + role guards
└── main.tsx          # Entry point (loads fonts, tokens, base)
```

### Routing & Authorization

Routes are declared in `App.tsx` with role-based guards:
- `/login` — Public
- `/` (SearchPage) — Requires auth, roles: professor, admin
- `/bookings` — Requires auth, role: professor
- `/admin` — Requires auth, role: admin
- `/design` — Dev-only design system review (DEV builds only)

### Design System

**Tokens** (`tokens.css`): Single source of truth for colors, spacing, typography, border-radius, motion. Supports light/dark via `prefers-color-scheme`.

**Base** (`base.css`): Reset, global styles, logical properties for RTL support, `prefers-reduced-motion`.

**Components** use CSS Modules referencing tokens. No raw values in components.

### Mock Data

- `src/api/mock/users.ts` — Demo accounts (2 professors, 1 admin)
- `src/api/mock/auth.ts` — Session handling via `sessionStorage`
- `IS_DEMO` flag in `api/index.ts` drives demo helpers on login page

### Internationalization (RTL)

- `base.css` uses logical properties (margin-inline, padding-inline)
- `DesignSystem.tsx` demonstrates RTL toggle
- Arabic font (IBM Plex Sans Arabic) is bundled
- Language switching not yet implemented — see spec for requirements

## Current State

- **Implemented**: Login, AppShell (nav, user menu), route guards, design tokens, base components, placeholder pages
- **In Progress**: SearchPage, BookingsPage, AdminPage are placeholders (`ComingNext`)
- **Spec Target**: Full frontend enhancement per specification (scheduling, AI stats, AI reports, user management, homepage AI recommendations, i18n, theming, animations)

## Development Notes

- Components are modular and reusable — prefer composition over new components
- Mock API is the contract; UI never imports mock directly
- CSS tokens drive theming — never hardcode colors
- Animations respect `prefers-reduced-motion`
- RTL uses logical properties — test with `dir="rtl"` on html element