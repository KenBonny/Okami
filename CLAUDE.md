# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Astro dev server
npm run build        # Production build → ./dist
npm run preview      # Preview built output locally
npm test             # Run Jest tests once
npm run test:watch   # Jest in watch mode
npm run test:coverage
```

To run a single test file: `npx jest src/path/to/file.test.ts`

## Tech Stack

- **Astro 5** (file-based routing, static output) + **React 19** — being phased out; new work should avoid it (see Preferences)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **TypeScript** (strict mode)
- Deployed to **Cloudflare Pages** via `wrangler`
- Auth: **Google OAuth** implicit flow (`@react-oauth/google`)
- Storage: **Google Drive API v3** — all persistence is direct browser-to-Drive REST calls; there is no backend

## Architecture

All interactivity lives in client-side React. `src/pages/index.astro` mounts `<FreezerApp client:load />`, which wraps everything in `<GoogleOAuthProvider>`. `FreezerManager` is the single stateful root component.

### State: two `useReducer` hooks in `FreezerManager`

1. **`reduceFreezerItems`** (`freezerItemsReducer.ts`) — source-of-truth item list. Delete is soft (`isDeleted` + `deletedOn`); items are retained for `monthsToKeepDeletedItems` months before being filtered out on the next write.
2. **`sortFreezerItemsReducer`** (`sortFreezerItemsReducer.ts`) — derived, sorted/filtered view used for display. Updated by the search bar and sort headers.

No global state library (no Redux, Zustand, or Context). All state passes via props from `FreezerManager`.

### Google Drive persistence

Handled entirely in `src/google/drive.ts`. On login, `loadFreezerItemsFromGoogle` fetches the user's JSON file from Drive. A `useEffect` in `FreezerManager` auto-saves on every `freezerItems` change via `writeFreezerItemsToGoogleDrive`. The user session is stored in `localStorage` under the key `"user"` and rehydrated with automatic token refresh on page load.

### Config

App-level settings (Google Client ID, expiry defaults, warning thresholds) live in `config/default.json` and are merged into a typed `Config` object via `src/config.ts`. The CORS header `Cross-Origin-Opener-Policy: same-origin-allow-popups` in `astro.config.mjs` is required for the Google OAuth popup flow.

### Routing

Astro file-based only — `/`, `/about` (MDX), `/404`. No client-side router.

### Reusable UI components

`src/components/tailwind/` contains wrappers around Headless UI v2 (Button, Dialog, Input, Select, Table, etc.). Use these rather than raw HTML or new component libraries.

## Testing

Jest + `ts-jest` + `jsdom` + `@testing-library/react`. Test files sit alongside the source they test. Currently covers reducers, utility functions (warning thresholds, deleted-item retention), the search component, and the debounce hook.

## Preferences

- Target stack: Astro + vanilla TypeScript, no frameworks. React is being phased out — do not add new React code; when touching existing React components, prefer migrating to vanilla TS over extending React.
- Confirm before implementing. Default to brainstorming/discussion; don't assume a request to write code.
- Terse communication: no apologies, no preambles ("great question", "let me explain"), no narrating tool calls, no summaries of changes just made, no unsolicited code explanations.
