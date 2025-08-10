## Flow: Battle (Vote on a poll)

### Purpose

Present one poll at a time with a dark, mobile-first battle UI, allow a single vote, show results with smooth animations, and auto-generate endless battles.

### User journey

1. From Landing or BottomNav → `/#/vote` (bottom nav hidden on vote screen).
2. App loads next open poll where current user hasn't voted, or auto-generates new battles.
3. User sees dark battle screen with header (back button + category dropdown) and two fit cards.
4. User taps Fit A or Fit B → emerald selection ring appears, submit button enables.
5. Tap Submit → chosen card expands to full viewport, results morph into percentage bar with Next button.
6. Tap Next → loads next battle (endless auto-generation ensures always available).
7. Optional: tap Save (bookmark icon) or Expand (plus icon) on either fit card.

### Visual Design (Implemented)

- **Dark theme**: Near-black background (`bg-zinc-950`) with zinc-800 panels
- **Header row**: Circular back button + rounded category dropdown capsule  
- **Battle cards**: Two large grey cards with 2x2 item grids, fit names in bold
- **Versus badge**: White circular badge overlapping both cards in center
- **Button positioning**: Save/Expand in top-right for Fit A, top-left for Fit B
- **Submit bar**: Full-width emerald button, morphs to results percentage + Next button
- **Animations**: Smooth expand-to-full transition with reduced-motion support

### Automatic Battle Generation

- **Endless battles**: When user exhausts available polls, system auto-generates new ones
- **Random fit creation**: Uses catalog items to create diverse 4-item outfits
- **Battle descriptions**: Rotates through 15 engaging prompts ("Street style showdown", etc.)
- **No empty states**: Users never see "No open battles" after initial seed battles

### Responsibilities

- Enforce one vote per user per poll (`voters[userId]`).
- Update aggregate `votes` counts and compute percentage split.
- Auto-generate new battles when running low on available polls.
- Hide bottom navigation during battle experience.
- Provide smooth animations between states (idle → selected → results).

### Data writes/reads

- Read: `ofb.polls`, `ofb.catalog`, category filtering
- Write: `ofb.polls` (votes, voters, auto-generated battles), `ofb.saved` (bookmarking)

### Files touched

- `src/screens/Vote.tsx` — Complete redesign: dark UI, battle cards, state management, animations
- `src/contexts/PollsContext.tsx` — `getNextOpenPollForUser()` with auto-generation, `generateRandomBattle()`
- `src/contexts/CatalogContext.tsx` — items lookup for random battle generation
- `src/contexts/SavedContext.tsx` — bookmark persistence
- `src/App.tsx` — conditional bottom nav hiding on `/vote` route
- `src/index.css` — `.animate-expand-to-full` keyframes with reduced-motion support

### Component Architecture

- **HeaderRow**: Back button + category dropdown (All, Streetwear, Casual, etc.)
- **BattleCard**: Individual fit card with 2x2 grid, fit name, save/expand buttons
- **FitMediaStack**: 2x2 item grid with item names, expandable to carousel view
- **VersusBadge**: Overlapping circular badge between cards
- **SubmitOrResultsBar**: Morphing bottom bar (Submit → Results percentage + Next)
- **ResultsPercentBar**: Animated progress bar showing vote percentage

### Acceptance criteria

- Dark mobile-first UI matches design specifications exactly.
- Bottom navigation hidden during battle experience.
- Auto-generation prevents "No open battles" scenarios.
- Fit cards show 2x2 grids with fit names and item labels.
- Versus circle overlaps both cards, buttons positioned per side.
- Submit enables only after selection, smooth transition to results.
- Results show animated percentage bar with Next button.
- Category dropdown functional (UI-only for now).
- Save/Expand buttons positioned correctly but non-functional as specified.

### Future (P1+)

- Category filtering implementation with poll categorization.
- Functional Save/Expand features with full-screen media sheets.
- Poll lifecycle management (auto-close after time/vote thresholds).
- Enhanced animations and micro-interactions.
- User-generated battle descriptions and themes.
