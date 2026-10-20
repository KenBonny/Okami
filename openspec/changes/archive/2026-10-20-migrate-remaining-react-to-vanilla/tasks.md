## 1. Leaf Components: FreezerItemRow and FreezerItemRowHeader

- [x] 1.1 Rewrite `FreezerItemRow` as vanilla TypeScript module (currently in `src/components/FreezerItemRow.tsx`); handle inline edit mode (view/edit toggle), input field state, delete button, save callback. Create in `src/components/ui/freezer-item-row-vanilla.ts`; keep React version for now. Verify all row interactions (edit, save, delete, cancel) work manually.
- [x] 1.2 Rewrite `FreezerItemRowHeader` as vanilla TypeScript module (currently in `src/components/FreezerItemRowHeader.tsx`); render sortable column header with icon, click handler for sort dispatch. Create in `src/components/ui/freezer-item-row-header-vanilla.ts`; keep React version for now. Verify sort direction indicator updates correctly.
- [x] 1.3 Add unit tests for vanilla row components; verify no regression in sorting/editing behavior. `npm test` passes.

## 2. Form and Search Components

- [x] 2.1 Rewrite `AddFreezerItemForm` as vanilla TypeScript module (currently in `src/components/AddFreezerItemForm.tsx`); dispatch to freezer items store on form submit. Create in `src/components/ui/add-freezer-item-form-vanilla.ts`; keep React version for now. Verify adding an item updates the table and triggers autosave.
- [x] 2.2 Rewrite `SearchFreezerItems` as vanilla TypeScript module (currently in `src/components/SearchFreezerItems.tsx`); search input + "include deleted" toggle, dispatch to sorted items store. Create in `src/components/ui/search-freezer-items-vanilla.ts`; keep React version for now. Verify search/toggle updates table correctly.
- [x] 2.3 Add unit tests for vanilla form and search; verify filtering and submission still work. `npm test` passes.

## 3. Main Orchestrator: FreezerManager

- [x] 3.1 Rewrite `FreezerManager` as vanilla TypeScript orchestrator (currently `src/components/FreezerManager.tsx`). Create `src/components/manager-vanilla.ts` that:
  - Builds the full app DOM (nav with logo/about/auth, form, search, table)
  - Mounts vanilla row, header, form, search components
  - Subscribes to stores for state updates
  - Wires up all callbacks (add, delete, update, sort, auth success/logout)
  - Keep the React version for now.
- [x] 3.2 Verify full app flow end-to-end manually: login, load from Drive, add item, search, sort, edit, delete, logout, re-login. All interactions work without regressions.
- [x] 3.3 Run full test suite; all 55+ tests still pass (reducer, store, utility tests are unaffected).

## 4. Entry Point: Astro Migration

- [x] 4.1 Update `src/pages/index.astro`: remove `<FreezerApp client:load />` import and usage; add `<script type="module">` that imports and calls vanilla manager.
- [x] 4.2 Verify `npm run dev` serves the app correctly on `http://localhost:4321` (or whatever port). App loads with vanilla components, all features work.
- [x] 4.3 Verify `npm run build` succeeds and `npm run preview` shows the production build works.

## 5. Dependency Cleanup

- [x] 5.1 Delete React component files: `src/components/FreezerApp.tsx`, `src/components/FreezerManager.tsx`, `src/components/AddFreezerItemForm.tsx`, `src/components/SearchFreezerItems.tsx`, `src/components/FreezerItemRow.tsx`, `src/components/FreezerItemRowHeader.tsx`, `src/components/GoogleAuth.tsx` (already migrated to vanilla). Delete `src/components/tailwind/*.tsx` (all old Headless UI wrappers). Verify build still succeeds.
- [x] 5.2 Remove React integrations from `astro.config.mjs`: delete `import react from '@astrojs/react'` and `react()` from integrations array. Verify `npm run build` succeeds.
- [x] 5.3 Remove React dependencies from `package.json`: `react`, `react-dom`, `@astrojs/react`, `@react-oauth/google`, `@headlessui/react`, `@heroicons/react`, `@szhsin/react-autocomplete`, `react-datepicker`, `@testing-library/react`, `@types/react`, `@types/react-dom`. Run `npm install` and verify `npm run build` succeeds.
- [x] 5.4 Update test infrastructure: remove `@testing-library/react` usage from any remaining tests. Verify `npm test` passes with no React Testing Library imports.

## 6. Regression Testing and Verification

- [x] 6.1 Run full manual regression pass over golden path (login, add item to freezer, search items, sort by column, edit item inline, delete item, logout, re-login). Verify no visual or behavioral regressions compared to the React version.
- [x] 6.2 Verify app bundle size reduction (estimated ~500KB from removing React). Check build output.
- [x] 6.3 Verify all automated tests pass. `npm test` → all tests pass.
- [x] 6.4 Verify `npm run build` and `npm run preview` work; app is ready for production deployment.
