## Why

React is being phased out project-wide in favor of vanilla TypeScript (see [CLAUDE.md](../../../CLAUDE.md) Preferences). Astro stays as the static-site/routing layer; only the client-side interactivity currently implemented as a single React island (`FreezerApp`) needs to move off React. Google OAuth must keep working, but does not need to go through the React-specific `@react-oauth/google` wrapper — Google's own Identity Services JS SDK covers the same flow without a framework dependency.

## What Changes

- **BREAKING** (internal only, no user-facing behavior change): replace the React component tree (`FreezerApp`, `FreezerManager`, `GoogleAuth`, `AddFreezerItemForm`, `SearchFreezerItems`, `FreezerItemRow`, `FreezerItemRowHeader`) with vanilla TypeScript modules driving the DOM directly.
- Replace `@react-oauth/google` (`GoogleOAuthProvider`, `useGoogleLogin`, `googleLogout`) with direct use of the Google Identity Services SDK (`accounts.google.com/gsi/client`), preserving the existing implicit-flow + Drive scope + localStorage session + silent-refresh behavior.
- Replace the `useReducer`/`useState`/`useEffect` glue in `FreezerManager` with a small vanilla state/store mechanism wrapping the existing (already framework-agnostic) `FreezerItemsReducer` and `SortFreezerItemsReducer`.
- Rebuild the `src/components/tailwind/*` Headless UI wrapper components (button, input, dialog, listbox/select, combobox, switch, etc.) as vanilla TS/DOM equivalents; style-only wrappers port mechanically, behavioral widgets (dialog, combobox, autocomplete, switch) need hand-rolled or native-HTML replacements.
- Replace `react-datepicker` and `@szhsin/react-autocomplete` with vanilla or native-HTML equivalents.
- Remove `react`, `react-dom`, `@astrojs/react`, `@react-oauth/google`, `@headlessui/react`, `@heroicons/react`, `@szhsin/react-autocomplete`, `react-datepicker`, `framer-motion` (if unused outside Headless UI), and `@testing-library/react` from `package.json`.
- Update `src/pages/index.astro` to mount the app via a plain `<script type="module">` entry point instead of `<FreezerApp client:load />`.
- Update test infrastructure: replace `@testing-library/react` usage (currently only `src/effects/useDebounce.test.ts`) with plain function tests or `@testing-library/dom`; jsdom test environment likely still needed for DOM-manipulating unit tests.

No functional or UX behavior changes are intended — the freezer inventory app should look and behave the same to end users after migration. This is purely a technology/implementation change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — no spec-level (user-facing behavior) requirements change. This is an implementation/technology migration; see `design.md` for the technical approach.

## Impact

- **Affected code**: all of `src/components/*.tsx` and `src/components/tailwind/*.tsx`, `src/pages/index.astro`, `src/effects/useDebounce.ts` (+ test), `astro.config.mjs` (drop `@astrojs/react` integration).
- **Unaffected**: `src/google/drive.ts`, `FreezerItemsReducer.ts`, `SortFreezerItemsReducer.ts`, `Utils.ts`, `DetermineWarning.ts`, `RemoveDeletedItems.ts`, `src/config.ts` — already framework-agnostic.
- **Dependencies removed**: `react`, `react-dom`, `@astrojs/react`, `@react-oauth/google`, `@headlessui/react`, `@heroicons/react`, `@szhsin/react-autocomplete`, `react-datepicker`, `@testing-library/react`, and possibly `framer-motion`.
- **Dependencies added**: none required in principle (Google Identity Services loads via `<script>` tag, no npm package needed); any replacement for datepicker/combobox behavior is a design-time decision, not committed here.
- **Testing**: Jest config (`testEnvironment`) and a handful of test files need updating to drop React Testing Library.
