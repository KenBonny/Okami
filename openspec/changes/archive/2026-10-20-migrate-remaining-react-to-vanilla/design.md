## Context

The previous change (remove-react-adopt-vanilla-ts) successfully migrated the state layer (vanilla stores) and authentication (vanilla GoogleAuth) to TypeScript. Five React components remain: `FreezerManager` (main orchestrator), `AddFreezerItemForm`, `SearchFreezerItems`, `FreezerItemRow`, and `FreezerItemRowHeader`. These must be converted to vanilla TypeScript with direct DOM manipulation while maintaining all existing functionality.

All business logic is already framework-agnostic (reducers, stores, Drive persistence). React is now only an unnecessary wrapper around DOM operations.

## Goals / Non-Goals

**Goals:**
- Convert all remaining React components to vanilla TypeScript
- Remove all React dependencies from the project
- Update entry point (index.astro) to mount vanilla app via script module
- Maintain 100% feature parity with current app
- Keep bundle size reduction from removing React (~500KB estimated)
- Pass all existing tests without React Testing Library

**Non-Goals:**
- Changing UI/UX or visual design
- Optimizing component render performance (vanilla is already more efficient)
- Adding new features or fixing existing bugs

## Decisions

**1. Component Migration Order: Bottom-Up (Dependency Inversion)**
- First: `FreezerItemRow`, `FreezerItemRowHeader` (leaf components, no consumer dependencies)
- Second: `AddFreezerItemForm`, `SearchFreezerItems` (used by FreezerManager)
- Last: `FreezerManager` (root orchestrator, depends on others)

Rationale: Each conversion can be tested independently before being integrated into consumers. Prevents cascading failures and allows incremental verification.

**2. Rendering Pattern: Direct DOM Manipulation with Subscription**
Each vanilla component is a function that:
1. Creates DOM elements with `document.createElement()` or template cloning
2. Registers with store subscriptions for state changes  
3. On state change, updates only affected DOM regions (not full re-render)

Rationale: Matches the pattern already established in previous vanilla components (GoogleAuth, form/search UI factories). Avoids virtual DOM complexity while maintaining reactivity via pub-sub.

**3. Event Handling: Direct addEventListener on Vanilla Elements**
Wire up click, input, change, submit events directly on created elements rather than using React's synthetic event system.

Rationale: No event delegation layer needed; native events are simpler and perform better.

**4. Entry Point: Astro script module with manual orchestration**
Update `src/pages/index.astro`:
- Remove `<FreezerApp client:load />` (React component mount)
- Add `<script type="module">` that imports the vanilla manager and calls it with a DOM target

Rationale: Astro is kept for static routing; only client-side interactivity moves to vanilla. No build-time changes needed beyond this mount swap.

**5. Testing Strategy: Jest + jsdom, no React Testing Library**
- Reducer and store tests: already vanilla, no change needed
- Component tests: either migrate to testing vanilla DOM directly (using `@testing-library/dom` if needed) or remove if behavior is well-covered by integration/e2e tests
- Alternative considered: keep @testing-library/react only for testing. Rejected — defeats the goal of removing React entirely; @testing-library/dom is sufficient for asserting DOM output from vanilla component factories

## Risks / Trade-offs

- **Lost TypeScript prop validation** (React components had typed props): Vanilla functions accept options objects without compile-time prop checking. Mitigation: Strict TypeScript interfaces for options objects provide similar safety; runtime errors caught in tests.
- **No automatic form state binding** (React's form value syncing): Must manually sync input values to store/state. Mitigation: Establish clear pattern (always read from store, write via dispatch on change events).
- **Larger refactoring surface area**: Five components × event handlers + state subscriptions = more places to get wrong. Mitigation: Incremental migration + existing comprehensive test coverage catches errors.
- **Potential UX regression from DOM order changes** (React diffing vs manual updates): Changing the order components append/update children could break layout. Mitigation: Keep existing DOM structure and only update innerText/classList/attributes, not append order, unless explicitly needed.

## Migration Plan

1. Create vanilla replacements for each component in `src/components/ui/` directory
2. Update `FreezerManager.tsx` to import vanilla versions instead of React children (one at a time, testing after each)
3. Once all children are vanilla, rewrite `FreezerManager` itself as vanilla
4. Update `src/pages/index.astro` to mount vanilla entry point
5. Remove React from `astro.config.mjs` integrations
6. Remove React dependencies from `package.json`
7. Run full test suite; update/remove React Testing Library tests
8. Manual regression test (golden path: login, add, search, sort, edit, delete, logout, re-login)

Rollback: `git revert` the commit; React dependencies are still available to be reinstalled.

## Open Questions

- Should we keep react component files in place as references during migration, or delete them as each is converted? (Low-impact: decide during task 1 of implementation)
