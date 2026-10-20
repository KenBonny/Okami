## 1. Table restyle

- [x] 1.1 Add severity left-accent-bar utilities to `src/styles/global.css` inside `@layer utilities {}` and verify `npm run build` emits the classes in the CSS output
- [x] 1.2 In `freezer-item-row.ts`, stop setting the warning class on the `<tr>`; apply it to the five data cells and the accent bar to the first data cell, in view and edit mode, leaving action cells unstyled; verify with row tests asserting classes on data cells and none on action cells or the `<tr>`
- [x] 1.3 Verify manually in `npm run dev` that edit, save, and delete icons are legible on first-warning, second-warning, and expired rows

## 2. Shared item editor

- [x] 2.1 Extract edit/save/delete state and handlers from `freezer-item-row.ts` into a shared function (for example `createItemEditor`) and verify the existing row tests pass unchanged
- [x] 2.2 Add unit tests for the shared function covering toggle edit, save, and delete callbacks

## 3. Card component

- [x] 3.1 Create `src/components/ui/freezer-item-card.ts` with view mode: description and notes, label/value pairs for type, amount, frozen, expires, severity tint and accent bar, and a neutral footer with edit and delete
- [x] 3.2 Add inline edit mode to the card using the shared editor (full-width inputs for description, notes, amount; save control in the footer) and verify with `freezer-item-card.test.ts` covering view, edit, save, and delete
- [x] 3.3 Verify the card test asserts severity classes on the body and none on the footer for a warning item and an item without warning

## 4. Manager wiring

- [x] 4.1 In `manager.ts`, add a card list container and render it from the filtered `sortedState.items`, copied and sorted by expiration ascending, in both store subscribers; verify cards stay in expiration order when the table sort changes
- [x] 4.2 Toggle visibility with `hidden md:block` on the table wrapper and `md:hidden` on the card list; verify at 767px and 768px widths in the browser
- [x] 4.3 Verify search text and "include deleted" change the table and cards identically, and that an edit or delete on a card updates the table and autosaves

## 5. Final checks

- [x] 5.1 `npm test` passes
- [x] 5.2 `npm run build` succeeds
- [x] 5.3 Manual pass on a phone-width viewport and a desktop viewport: login, add, search, edit on card, delete on card, table sort, logout
