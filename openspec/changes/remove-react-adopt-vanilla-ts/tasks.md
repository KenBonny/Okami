## 1. Style-only design system components

- [x] 1.1 Delete the 18 unused `src/components/tailwind/*` wrappers (Alert, AuthLayout, Avatar, Badge, Checkbox, Combobox, DescriptionList, Dialog, Divider, Dropdown, Heading, Link, Listbox, Navbar, Pagination, Radio, Select, SidebarLayout, Sidebar, StackedLayout, Text, Textarea) — confirmed unused via grep across `src`.
- [x] 1.1b Rewrite the remaining used wrappers (Button, Input, Fieldset — only `Field`/`Fieldset`/`Label`, Switch, Table, AutoCompleteInput) as plain TS functions in a new `src/components/ui/` directory (kept alongside, not replacing, the still-referenced `src/components/tailwind/*.tsx` React versions until their last consumer is migrated in a later phase, so the app keeps building throughout), translating `data-hover`/`data-active`/`data-focus`/`data-disabled`/`data-invalid` to native `:hover`/`:active`/`:focus-visible`/`:disabled`/`:invalid`.
- [x] 1.2 Add unit tests for the new `src/components/ui/*` factories covering rendered structure/classes and interactive behavior (button click/disabled, switch change, autocomplete filter/keyboard nav); `npm test` passes.
- [ ] 1.3 Once each of `src/components/tailwind/{button,input,fieldset,switch,table,autocomplete-input}.tsx` has no remaining consumer (after phases 3-6 migrate `SearchFreezerItems`, `FreezerItemRow`, `FreezerItemRowHeader`, `AddFreezerItemForm`, `GoogleAuth`, `FreezerManager`), delete that file.

## 2. Google auth migration

- [x] 2.1 Load the Google Identity Services script (`accounts.google.com/gsi/client`) and gate auth UI on its `onload`; verify the login control is disabled/inert until the script is ready. Implemented in `src/google/auth.ts` (`onGisReady`); the "Sign in with Google" button in `GoogleAuth.tsx` is `disabled` until the token client is created.
- [x] 2.2 Replace `useGoogleLogin`/`GoogleOAuthProvider` with `google.accounts.oauth2.initTokenClient` in a vanilla auth module, preserving the current localStorage `"user"` schema, expiry calculation, and silent-refresh `setTimeout` scheduling from `GoogleAuth.tsx`; verify by logging in and confirming a `User` object is stored in localStorage with the same shape as today. `src/google/auth.ts` wraps `initTokenClient`/`revoke`; `GoogleAuth.tsx`'s `handleSuccessfulLogin`/`onValidUser`/expiry/`setTimeout` logic is unchanged. Needs a manual login pass with real credentials to fully confirm (see 2.4/2.5).
- [x] 2.3 Remove the `GoogleOAuthProvider` wrapper; verify the app still authenticates without it. `FreezerApp.tsx` no longer wraps `FreezerManager` in `GoogleOAuthProvider`; `npm run build` and `astro dev` both serve the app without errors.
- [ ] 2.4 Verify manually: session persists across a page reload, and a scheduled silent refresh fires before token expiry (inspect via logging/devtools timers).
- [ ] 2.5 Verify manually: after login, Drive read (`loadFreezerItemsFromGoogle`) and write (`writeFreezerItemsToGoogleDrive`) still succeed unchanged.

## 3. Store and reducer wiring

- [x] 3.1 Implement a minimal `createStore(reducer, initialState)` pub-sub helper (`getState`/`dispatch`/`subscribe`); add a unit test covering subscribe, dispatch, and unsubscribe behavior. Implemented in `src/store.ts`; `src/store.test.ts` covers initial state, dispatch/notify, unsubscribe, and multiple independent subscribers.
- [x] 3.2 Wrap `FreezerItemsReducer` and `SortFreezerItemsReducer` in stores created via `createStore`; verify the existing reducer unit tests still pass unmodified (reducers themselves are not changed). Added `src/components/stores.ts` exporting `freezerItemsStore`/`sortedFreezerItemsStore`; not yet wired into `FreezerManager.tsx` (still React/`useReducer` until phase 7's rewrite) — `npm test` confirms all existing reducer tests pass unmodified (50 tests, 8 suites).

## 4. Search + debounce

- [ ] 4.1 Convert `useDebounce` into a plain `debounce(fn, delay)` function; rewrite its test as a direct function test with fake timers, dropping `@testing-library/react`; verify the test passes.
- [ ] 4.2 Rewrite `SearchFreezerItems` as a vanilla module (search input + "include deleted" switch) wired to the sort store via dispatch; verify the existing `filter()` unit tests still pass and manual search/toggle behavior in the browser matches today.

## 5. Autocomplete + datepicker

- [ ] 5.1 Implement a vanilla autocomplete input following the WAI-ARIA combobox pattern to replace `AutoCompleteInput`/`@szhsin/react-autocomplete`; verify keyboard navigation (arrow keys, Enter, Escape) and mouse selection manually.
- [ ] 5.2 Replace `react-datepicker` with a native `<input type="date">` in `AddFreezerItemForm`; verify the selected date round-trips correctly into the item state and Drive payload.

## 6. Add-item form and row interactions

- [ ] 6.1 Rewrite `AddFreezerItemForm` as a vanilla module dispatching to the freezer items store; verify adding an item updates the table and triggers autosave to Drive.
- [ ] 6.2 Rewrite `FreezerItemRow` (inline edit) and `FreezerItemRowHeader` (sortable header) as vanilla modules; verify edit, delete, and sort interactions manually and confirm existing reducer tests still pass.

## 7. Root orchestration and mount

- [ ] 7.1 Rewrite `FreezerManager` as a vanilla entry module wiring the stores to the child regions built in tasks 1-6; verify full app flow end-to-end manually (login, load from Drive, add/search/sort/edit/delete, autosave).
- [ ] 7.2 Update `src/pages/index.astro` to mount the app via `<script type="module">` instead of `<FreezerApp client:load />`; verify `npm run dev` and `npm run build` both serve/build the app correctly.

## 8. Dependency cleanup and regression pass

- [ ] 8.1 Remove `react`, `react-dom`, `@astrojs/react`, `@react-oauth/google`, `@headlessui/react`, `@heroicons/react`, `@szhsin/react-autocomplete`, `react-datepicker`, `framer-motion` (if confirmed unused), `@testing-library/react`, `@types/react`, `@types/react-dom` from `package.json`; verify `npm install` and `npm run build` succeed.
- [ ] 8.2 Remove the `@astrojs/react` integration from `astro.config.mjs`; verify `npm run build` succeeds.
- [ ] 8.3 Update Jest config for the post-React test suite; verify `npm test` passes with no `@testing-library/react` usage remaining.
- [ ] 8.4 Run a full manual regression pass over the golden path (login, add item, search, sort, edit, delete, logout, re-login) and confirm no visual or behavioral regressions versus the pre-migration app.
