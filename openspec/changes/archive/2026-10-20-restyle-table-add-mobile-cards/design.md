## Context

See proposal.md - Why.

- `freezer-item-row.ts` sets the warning class (`first-warning`, `second-warning`, `expired` in `global.css`) on the `<tr>`, so the action cells inherit the background.
- `manager.ts` rebuilds the table body from `sortedFreezerItemsStore.getState().items` in two subscribers (items store and sorted store). That list is already filtered by search and "include deleted"; the table's sort order comes from the sort headers.
- Row and cell construction is plain DOM factories in `src/components/ui/`; no framework.

## Goals / Non-Goals

**Goals:**
- Action icons readable on every severity.
- Phone-friendly card list with inline editing and the same severity cues as the table.

**Non-Goals:**
- No sort controls on cards.
- No change to the add form, search, stores, reducers or Drive persistence.
- No dark-mode work.

## Decisions

**Two renderers, toggled by CSS.** The table wrapper gets `hidden md:block`, the card list `md:hidden`. Both render on every update.
- Alternative: reflow the `<tr>` into a grid below `md`. Less code, but the edit inputs stay inside table markup and are awkward on touch.
- Cost: two DOM trees per item. The list is small, so this is acceptable.

**Cards reuse the existing filter, own their order.** Cards render from `sortedState.items` (already filtered), copied and sorted by `expiration` ascending. The table keeps the user's sort; the card order never changes with it. Search and "include deleted" therefore behave identically in both views.

**Shared item actions.** Extract edit/save/cancel/delete state from `freezer-item-row.ts` into a small function (for example `createItemEditor`) holding `editing`, `editedItem`, `toggleEdit`, `save` and `delete`. The row and the card each supply only their own markup.
- Alternative: duplicate the logic in the card. Rejected; it would drift.

**Warning on data cells, not the row.** The row stops setting `warningCss` on `<tr>`. The five data cells get it, in view and edit mode, and the action cells get no class. The same class mapping from `determineWarning` is used for cards.

**Accent bar.** A left border on the first data cell (row) and on the card, colored per severity through new utilities in `global.css` inside `@layer utilities {}` (required for `@apply` in Tailwind v4).
- Cards tint the body with the severity background, matching the table's data cells. The action buttons sit on a neutral footer strip so they never inherit the tint.

**Card layout.** Description and notes on top, then type, amount, frozen, and expires as label/value pairs, with edit and delete in a neutral footer. In edit mode the fields become full-width inputs with large touch targets, and save/cancel replace edit/delete.

## Risks / Trade-offs

- [Two renderers rebuild on every store change] → Same cost model as the existing table rebuild; no change to the update flow.
- [Edit state is lost when a store update rebuilds the list mid-edit] → Existing behavior for the table; cards inherit it. Not addressed here.
