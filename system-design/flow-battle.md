## Flow: Battle (Vote on a poll)

### Purpose

Present one poll at a time, allow a single vote, show results, and advance to next.

### User journey

1. From Landing or BottomNav → `/#/vote`.
2. App loads next open poll where current user hasn’t voted.
3. User taps Fit A or Fit B → selection outline appears.
4. Tap Submit → chosen card expands briefly, results reveal as percentages.
5. Tap “next fit battle” to load the next poll.
6. Optional: tap Save on either fit to bookmark it to Saved.

### Responsibilities

- Enforce one vote per user per poll (`voters[userId]`).
- Update aggregate `votes` counts.
- Compute percentage split client-side.
- Provide bookmark entry points.

### Data writes/reads

- Read: `ofb.polls`, `ofb.catalog`
- Write: `ofb.polls` (votes, voters), `ofb.saved` (when bookmarking)

### Files touched

- `src/screens/Vote.tsx` — UI, selection, submit, result reveal, next link
- `src/components/FitCard.tsx` — renders items and Save control
- `src/contexts/PollsContext.tsx` — `getNextOpenPollForUser()`, `voteOnPoll()`
- `src/contexts/CatalogContext.tsx` — items lookup
- `src/contexts/SavedContext.tsx` — bookmark persistence
- `src/index.css` — `.animate-expand` animation

### Acceptance criteria

- If no eligible polls, show empty state CTA to Create.
- Selecting a side enables submit; submit records vote exactly once for the user.
- After submit, results display and “next fit battle” moves to next poll.
- Save toggles persist to `ofb.saved`.

### Future (P1+)

- Close polls after a time window; category battles; comments; richer animation.
