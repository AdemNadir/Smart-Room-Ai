# SMART ROOM AI — Frontend

A premium academic React frontend for searching university rooms, reading natural-language requests, and managing bookings and operations. The application follows the frozen Team Contract in `Guide and prompt/MEMBER_3_FRONTEND_PROMPT.md`; all availability, eligibility, ranking, conflict, approval, and insight decisions come from the API.

## Stack

- React 18 and React DOM 18
- Vite 8 and `@vitejs/plugin-react` 6
- Plain JavaScript and CSS; no TypeScript, router, UI kit, chart library, or HTTP client
- Locally bundled `@fontsource` fonts: Cormorant Garamond, Inter, Noto Sans Arabic
- Same-origin `/api/*` fetch calls with cookie credentials and a Vite dev proxy to `http://127.0.0.1:8000`

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- A compatible backend listening on `127.0.0.1:8000` for real API mode, or no backend for mock mode

## Install and run

```bash
cd frontend
npm install
```

### Real API mode (default)

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. The dev server proxies `/api` to `http://127.0.0.1:8000`. The backend must set the session cookie; the frontend never stores tokens in browser storage.

### Mock mode (opt-in demo)

Mock mode is for reviewing the UI without a backend. It is never the default. A banner on every screen labels the sample data.

PowerShell:

```powershell
$env:VITE_USE_MOCK='1'; npm run dev -- --host 127.0.0.1
```

macOS/Linux:

```bash
VITE_USE_MOCK=1 npm run dev -- --host 127.0.0.1
```

`cmd.exe`:

```bat
set VITE_USE_MOCK=1&& npm run dev -- --host 127.0.0.1
```

In mock mode, any non-empty password works. A username containing `admin` opens the administrator area; any other username opens the professor area. See `docs/DEMO_SCRIPT.md` for scripted scenarios and error triggers.

### Production build

```bash
npm run build
npm run preview
```

`npm run build` writes to `frontend/dist`. `npm run preview` serves that build locally.

### Verification

```bash
npm run check
npm run build
npm audit
```

`npm run check` runs a static contract checker covering the frozen dependency set, API coverage and headers, forbidden browser APIs and remote resources, string completeness, status/error copy, result-order preservation, mock fixtures, and production output.

## What is implemented

- Login, session restore through `GET /api/auth/me`, role-aware hash routing, sign out, and visible session-expiry recovery
- Professor search: natural-language request reader preview, editable criteria, server-owned results, Day-Strip, excluded rooms, hints, free window, match score, reasons, and booking dialog
- Booking success, pending, conflict with alternatives, eligibility failure with alternatives, validation, and server-message/error states
- My Bookings with upcoming/all sessions, confirmed/pending/cancelled/rejected states, and cancellation confirmation
- Admin dashboard with server metrics and grounded insights; Rooms register with edit and active toggle; staged Import with preview, errors, warnings, and publish; Bookings with approve/reject/cancel; Insights; Audit log; Settings
- Loading, empty, error, offline, timeout, rate-limit, unauthorized, conflict, and pending states
- Accessible controls, visible labels for status (never colour alone), polite live regions, `dir="auto"` for user/AI/file text, reduced-motion support, and layouts verified at 360px and 1280px

## Contract safeguards

- Every non-GET request sends `X-SmartRoom-Client: web`; JSON requests set `Content-Type: application/json`; multipart uploads do not set a multipart content type.
- All fetch calls are centralized in `frontend/src/services/api.js` and use `credentials: 'same-origin'`, an abort controller, and a timeout.
- `results` and `excluded` arrays are rendered in the order returned by the server. The frontend does not sort, filter, reverse, or recalculate them.
- Unknown server values, including approval modes and statuses, remain visible instead of being renamed or silently substituted.
- No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`, remote fonts/scripts/images/CDNs, inline scripts, or token storage.

## Project layout

```text
frontend/
  index.html
  vite.config.js
  package.json
  scripts/check-contract.mjs
  src/
    main.jsx
    App.jsx
    strings.js
    auth/AuthContext.jsx
    services/api.js, errors.js, mock.js
    hooks/useResource.js, useInsights.js
    utils/format.js, router.js, validation.js
    styles/tokens.css, base.css, layout.css, components.css, admin.css
    components/  (shell, forms, rooms, bookings, admin, common)
    pages/       (Login, Search, MyBookings, six admin pages)
docs/
  DEMO_SCRIPT.md
  sample-schedule.csv
  sample-schedule-errors.csv
```

## Known limitations

- The workspace contained no backend source, running server, or `demo_credentials.txt`. Real backend end-to-end integration, two-device LAN use, real-server offline behaviour, and CSP console verification were not performed here.
- Mock mode is a UI fixture, not a business-rule implementation. Its rooms, metrics, insights, and audit entries are synthetic.
- FR/AR interface translation and CSV export are optional P1 items and are not implemented; the request reader accepts Arabic and French text and renders returned language tags.
- The mock My Bookings list starts empty; use the demo script to create sessions. The "All sessions" toggle shows sessions created during the current mock session.
- There is no git repository in this workspace, so no commits were made.
