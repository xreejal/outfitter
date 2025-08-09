## Flow: Recents & Saved

### Purpose

- Recents: show polls published by the current user and their results for quick review.
- Saved: show bookmarked fits from other users (or mine) with links back to Vote.

### User journey (Recents)

1. From Landing or BottomNav → `/#/recents`.
2. See list of my polls (description + % split). Back returns to `/#/`.

### User journey (Saved)

1. From Landing or BottomNav → `/#/saved`.
2. See list of saved fits. Tapping navigates to `/#/vote` so the user can view the poll again.

### Responsibilities

- Recents: derived view over `ofb.polls` by `authorId`.
- Saved: list and manage saved entries stored in `ofb.saved`.

### Data writes/reads

- Recents: Read-only `ofb.polls`.
- Saved: Read `ofb.saved`; write when bookmarks are toggled from Vote.

### Files touched

- `src/screens/Recents.tsx` — render list, simple percentages
- `src/screens/Saved.tsx` — render bookmarks and deep-link back to Vote
- `src/contexts/PollsContext.tsx` — source of polls
- `src/contexts/SavedContext.tsx` — source of saved entries
- `src/contexts/UserContext.tsx` — user id used for filtering recents

### Acceptance criteria

- Recents lists all my polls with correct A/B percentages.
- Saved lists all saved fits, each linking to `/#/vote`.
- Both screens include a back button to home.

### Future (P1+)

- Enable add-to-cart via Shop Minis APIs.
- Add tabs within Recents for different modes when we introduce more battle types.
