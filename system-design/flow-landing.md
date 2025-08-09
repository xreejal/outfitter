## Flow: Landing Page

### Purpose

Entry to the mini. Provides quick actions to start voting, start creating, and access recents/saved. Fit Battles is disabled in MVP (P1).

### User journey

1. User opens mini → `/#/` route.
2. Sees title, two primary buttons:
   - choose fits → `/#/vote`
   - fit battles (disabled)
3. Bottom nav allows navigation to Recents, Create, Saved, Vote.

### Responsibilities

- Pure navigation, no data writes.
- Visual baseline for the app.

### Files touched

- `src/screens/Landing.tsx` — screen UI and buttons
- `src/components/BottomNav.tsx` — persistent navigation
- `src/App.tsx` — hash router and route mapping
- `src/index.css` — shared styles (tailwind + animation)

### Dependencies

- None of the data contexts are required to render, but screen is wrapped by providers from `App.tsx`.

### Acceptance criteria

- Buttons navigate to the correct routes.
- Fit battles button visually disabled.
- Back button not shown on Landing (home).

### Future (P1)

- Enable Fit Battles button to a new route and feature flag gating.
