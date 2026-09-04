## Context

Astro stays; only the client-side React island (`FreezerApp` -> `FreezerManager` -> children) and its Headless UI-based design system (`src/components/tailwind/*`) are being replaced. The domain/data layer (`FreezerItemsReducer`, `SortFreezerItemsReducer`, `drive.ts`, `Utils.ts`, `DetermineWarning.ts`, `RemoveDeletedItems.ts`) has no React dependency today and is not being rewritten — this design only covers what sits on top of it. See proposal.md - Why/What Changes for motivation and scope.

## Goals / Non-Goals

**Goals:**
- Define the replacement for React's render-on-state-change model.
- Define how Google OAuth moves off `@react-oauth/google` while preserving current session/refresh behavior exactly.
- Decide, per Headless UI widget category, whether native HTML or hand-rolled JS replaces it.
- Keep the dependency count as low as possible — prefer native browser APIs over new libraries.

**Non-Goals:**
- Redesigning the UI/UX or visual style.
- Changing the Drive persistence format or reducer logic.
- Introducing a build-time templating tool, a router, or any state-management library.

## Decisions

**1. Rendering: hand-written DOM functions, no virtual DOM, no templating library.**
Each UI unit becomes a plain function that creates/updates real `HTMLElement`s via `document.createElement`/`<template>` cloning. Rejected a lightweight templating helper (e.g. lit-html) to keep zero new runtime dependencies, consistent with the "no frameworks" preference; revisit only if hand-written DOM code becomes unmanageable during implementation.

**2. State: a small store wrapping the existing reducers, not a full re-render.**
Introduce a minimal `createStore(reducer, initialState)` (subscribe/dispatch/getState, ~30 lines, no dependency) wrapping `FreezerItemsReducer` and `SortFreezerItemsReducer` unchanged. UI regions subscribe only to the slice they render and re-render just that region on change.
- Alternative considered: full-page re-render from state on every change. Rejected — it drops input focus/cursor position in the search box and add-item form while typing.
- Alternative considered: a signals library (e.g. `@preact/signals-core`). Rejected — adds a dependency for a benefit (fine-grained reactivity) this app's scale doesn't need; a manual pub-sub is enough.

**3. Auth: Google Identity Services (GIS) token client, replacing `@react-oauth/google` entirely.**
Load `accounts.google.com/gsi/client` via a `<script>` tag, call `google.accounts.oauth2.initTokenClient({ client_id, scope, callback })` and `.requestAccessToken()` in place of `useGoogleLogin`. Keep the existing localStorage session shape, expiry calculation, and `setTimeout`-based silent-refresh scheduling from `GoogleAuth.tsx` as-is — that logic never depended on React, only the component shell around it does.
- Alternative considered: keep `@react-oauth/google` only for auth, vanilla-ize everything else. Rejected — reintroduces a React runtime dependency solely for auth, defeating the goal.

**4. Headless UI replacement: prefer native elements; hand-roll only what native HTML can't do.**

Only 6 of the 24 `src/components/tailwind/*` files are actually imported elsewhere in `src` (confirmed via grep); the other 18 (Alert, AuthLayout, Avatar, Badge, Checkbox, Combobox, DescriptionList, Dialog, Divider, Dropdown, Heading, Link, Listbox, Navbar, Pagination, Radio, Select, SidebarLayout, Sidebar, StackedLayout, Text, Textarea) are unused Catalyst UI-kit boilerplate and are deleted outright rather than translated — no `.astro` page or component references them.

The 6 vanilla replacements live in a new `src/components/ui/` directory rather than overwriting `src/components/tailwind/*.tsx` in place — the React versions there are still imported by not-yet-migrated components (`SearchFreezerItems`, `FreezerItemRow`, `FreezerItemRowHeader`, `AddFreezerItemForm`, `GoogleAuth`, `FreezerManager`), so replacing their export shape (React components → DOM-factory functions) immediately would break the build ahead of the phases that actually migrate those consumers. Each `tailwind/*.tsx` file is deleted once the consumer-migration phase that removes its last import lands.

| Widget | Replacement | Rationale |
|---|---|---|
| Button, Input, Fieldset (`Field`/`Fieldset`/`Label` only) | Plain function returning a styled element, same Tailwind classes, `data-*` states mapped to native `:hover`/`:active`/`:focus-visible`/`:disabled`/`:invalid` | Style-only wrappers today; no behavior to reimplement |
| Switch | Native `<input type="checkbox">` styled as a toggle | No JS needed beyond CSS |
| Table | Plain functions returning styled `<table>`/`<tr>`/`<td>` elements | Style-only wrapper; the `href`-link `TableCell` variant is unused in the app and is dropped, not translated |
| Autocomplete (`AutoCompleteInput`, currently `@szhsin/react-autocomplete`) | Hand-rolled `<input>` + popover `<ul>` following the WAI-ARIA combobox pattern | No native element covers type-ahead + suggestion list; smallest custom surface in this design |
| Datepicker (`react-datepicker`) | Native `<input type="date">` | Removes a dependency entirely; trade-off accepted, see Risks |

General rule for this table: ask "does a native element already do this?" before writing custom JS. Headless UI's value in the React version was filling native gaps for React specifically — most of those gaps don't exist when using the underlying HTML element directly.

**5. Animation: CSS only, no `framer-motion`.**
Dialog/dropdown enter-exit transitions move to CSS transitions and `<dialog>`'s native `::backdrop`/`@starting-style` support. No JS animation library.

**6. Testing: drop `@testing-library/react`, keep jsdom.**
`useDebounce` becomes a plain function (no hook), so its test becomes a direct function test with fake timers — no rendering needed. Any test that must assert DOM output after a render function runs can use `@testing-library/dom` directly against the produced `HTMLElement`, no React adapter required. Jest `testEnvironment: "jsdom"` stays, since render functions still manipulate real DOM nodes in tests.

## Risks / Trade-offs

- Hand-rolled autocomplete loses Headless UI's built-in ARIA wiring → Mitigation: implement strictly per the WAI-ARIA combobox authoring pattern rather than improvising roles/attributes.
- Native `<input type="date">` has less visual polish than `react-datepicker`'s calendar UI → Mitigation: accept the regression for now; revisit with a small custom calendar only if it proves a real problem in use.
- Hand-written DOM update code is more verbose than JSX and risks stale-DOM bugs (forgetting to re-render after a dispatch) → Mitigation: all mutation goes through the store's `dispatch`; render functions are the only code allowed to touch the DOM for a given region, subscribed once at setup.
- GIS script loads asynchronously; a login click before it's ready would fail silently → Mitigation: disable/gate the login control until the script's load callback fires, mirroring how `GoogleOAuthProvider` already gates this today.
- Large surface area (6 wrapper components in scope + 5 feature components) increases the chance of a long-lived broken intermediate state → Mitigation: sequence the migration bottom-up (see tasks.md) so the app stays buildable after each phase.

## Migration Plan

No backend/data migration is involved — Drive's stored JSON format is untouched, and Cloudflare Pages deploys on merge, so rollback is a plain `git revert` if a phase regresses production. Sequencing (detailed in tasks.md) goes bottom-up by risk:
1. Style-only tailwind wrapper components
2. Google auth (GIS swap) — isolated boundary, highest-value early win
3. Search + debounce
4. Autocomplete + datepicker (the two components without a direct native/library replacement)
5. Add-item form + row inline edit
6. `FreezerManager` orchestration + store wiring
7. Remove React/Headless UI/`framer-motion` dependencies, switch `index.astro` mount, update test infra

Each phase leaves `main` in a working, deployable state.

## Open Questions

- Exact keyboard-interaction parity for the autocomplete's WAI-ARIA combobox pattern (which keys, wraparound behavior) — a detail to nail down during phase 4 implementation, doesn't change the chosen approach.
