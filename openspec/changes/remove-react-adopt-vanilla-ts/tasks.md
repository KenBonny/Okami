## 1. Style-only design system components

- [ ] 1.1 Rewrite the style-only `src/components/tailwind/*` wrappers (Button, Input, Textarea, Checkbox, Radio, Badge, Avatar, Text, Heading, Link, Divider, Fieldset, Description List) as plain TS functions returning styled `HTMLElement`s with the same Tailwind classes; verify each renders the same markup/classes as the current React version via a unit test.
- [ ] 1.2 Update any existing tests referencing these components to import the vanilla versions; verify `npm test` passes.

## 2. Google auth migration

- [ ] 2.1 Load the Google Identity Services script (`accounts.google.com/gsi/client`) and gate auth UI on its `onload`; verify the login control is disabled/inert until the script is ready.
- [ ] 2.2 Replace `useGoogleLogin`/`GoogleOAuthProvider` with `google.accounts.oauth2.initTokenClient` in a vanilla auth module, preserving the current localStorage `"user"` schema, expiry calculation, and silent-refresh `setTimeout` scheduling from `GoogleAuth.tsx`; verify by logging in and confirming a `User` object is stored in localStorage with the same shape as today.
- [ ] 2.3 Remove the `GoogleOAuthProvider` wrapper; verify the app still authenticates without it.
- [ ] 2.4 Verify manually: session persists across a page reload, and a scheduled silent refresh fires before token expiry (inspect via logging/devtools timers).
- [ ] 2.5 Verify manually: after login, Drive read (`loadFreezerItemsFromGoogle`) and write (`writeFreezerItemsToGoogleDrive`) still succeed unchanged.

## 3. Store and reducer wiring

- [ ] 3.1 Implement a minimal `createStore(reducer, initialState)` pub-sub helper (`getState`/`dispatch`/`subscribe`); add a unit test covering subscribe, dispatch, and unsubscribe behavior.
- [ ] 3.2 Wrap `FreezerItemsReducer` and `SortFreezerItemsReducer` in stores created via `createStore`; verify the existing reducer unit tests still pass unmodified (reducers themselves are not changed).

## 4. Search + debounce

- [ ] 4.1 Convert `useDebounce` into a plain `debounce(fn, delay)` function; rewrite its test as a direct function test with fake timers, dropping `@testing-library/react`; verify the test passes.
- [ ] 4.2 Rewrite `SearchFreezerItems` as a vanilla module (search input + "include deleted" switch) wired to the sort store via dispatch; verify the existing `filter()` unit tests still pass and manual search/toggle behavior in the browser matches today.

## 5. Autocomplete + datepicker

- [ ] 5.1 Implement a vanilla autocomplete input following the WAI-ARIA combobox pattern to replace `AutoCompleteInput`/`@szhsin/react-autocomplete`; verify keyboard navigation (arrow keys, Enter, Escape) and mouse selection manually.
- [ ] 5.2 Replace `react-datepicker` with a native `<input type="date">` in `AddFreezerItemForm`; verify the selected date round-trips correctly into the item state and Drive payload.

## 6. Add-item form and row interactions

- [ ] 6.1 Rewrite `AddFreezerItemForm` as a vanilla module dispatching to the freezer items store; verify adding an item updates the table and triggers autosave to Drive.
- [ ] 6.2 Rewrite `FreezerItemRow` (inline edit) and `FreezerItemRowHeader` (sortable header) as vanilla modules; verify edit, delete, and sort interactions manually and confirm existing reducer tests still pass.
- [ ] 6.3 Replace `Dialog` usages with native `<dialog>` (`showModal`/`close`); verify open/close and focus behavior manually.
- [ ] 6.4 Replace remaining behavioral wrappers (Listbox/Select, Dropdown, Pagination, Sidebar/Navbar toggles) with native-element equivalents per design.md's table; verify each interactive control manually against current behavior.

## 7. Root orchestration and mount

- [ ] 7.1 Rewrite `FreezerManager` as a vanilla entry module wiring the stores to the child regions built in tasks 1-6; verify full app flow end-to-end manually (login, load from Drive, add/search/sort/edit/delete, autosave).
- [ ] 7.2 Update `src/pages/index.astro` to mount the app via `<script type="module">` instead of `<FreezerApp client:load />`; verify `npm run dev` and `npm run build` both serve/build the app correctly.

## 8. Dependency cleanup and regression pass

- [ ] 8.1 Remove `react`, `react-dom`, `@astrojs/react`, `@react-oauth/google`, `@headlessui/react`, `@heroicons/react`, `@szhsin/react-autocomplete`, `react-datepicker`, `framer-motion` (if confirmed unused), `@testing-library/react`, `@types/react`, `@types/react-dom` from `package.json`; verify `npm install` and `npm run build` succeed.
- [ ] 8.2 Remove the `@astrojs/react` integration from `astro.config.mjs`; verify `npm run build` succeeds.
- [ ] 8.3 Update Jest config for the post-React test suite; verify `npm test` passes with no `@testing-library/react` usage remaining.
- [ ] 8.4 Run a full manual regression pass over the golden path (login, add item, search, sort, edit, delete, logout, re-login) and confirm no visual or behavioral regressions versus the pre-migration app.
