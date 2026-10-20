## Why

The expiration warning background is applied to the whole table row, so the edit and delete icons lose contrast on yellow, orange and red rows (red icon on red row is invisible). On phones the table also needs horizontal scrolling and is hard to read and edit.

## What Changes

- Move the warning classes from the `<tr>` to the data cells, in view and edit mode. The edit/save and delete action cells stay unstyled.
- Add a left accent bar on the first data cell, colored by warning severity.
- Add a card list for viewports below `md` (768px): one card per item, inline editing, same severity colors and accent bar as the table.
- Cards are ordered by expiration, soonest first, with no sort controls. The search filter and "include deleted" toggle apply to cards exactly as they do to the table.
- Show the table at `md` and up, the card list below, toggled with CSS.
- Extract edit/save/delete logic from `freezer-item-row.ts` into a function shared by the row and the card.
- The add item form is unchanged.

## Capabilities

### New Capabilities
- `freezer-item-display`: how freezer items are presented (table at `md` and up, cards below), including expiration severity cues, card ordering and inline editing.

### Modified Capabilities

## Impact

- `src/components/ui/freezer-item-row.ts`: warning class placement, accent bar, shared logic extracted.
- `src/components/ui/freezer-item-card.ts`: new.
- `src/components/manager.ts`: renders both the table and the card list from the same filtered items.
- `src/styles/global.css`: accent bar utilities.
- Tests for the row and the new card.
