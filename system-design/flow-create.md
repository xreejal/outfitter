## Flow: Create (Publish a Which-Fit poll)

### Purpose

Let a user assemble two fits (A/B) from catalog items and publish a poll.

### User journey

1. From Landing or BottomNav → `/#/create`.
2. Enter names for Fit A and Fit B.
3. Tap each of the three slots per side to open Item Picker and choose items (MVP shows all catalog items for all slots).
4. Enter a description.
5. Tap Publish → validation → poll created and persisted → redirect to Vote.

### Responsibilities

- Read catalog items.
- Produce and persist a new `Poll` in local storage and add the poll id to `index.myPollIds`.

### Data writes/reads

- Read: `ofb.catalog`
- Write: `ofb.polls`, `ofb.index` (prepend my poll id)

### Files touched

- `src/screens/Create.tsx` — UI, validation, publish
- `src/components/ItemPickerModal.tsx` — catalog picker
- `src/contexts/CatalogContext.tsx` — provides items
- `src/contexts/PollsContext.tsx` — `createPoll()` mutation
- `src/contexts/UserContext.tsx` — current user id
- `src/data/seed-loader.ts` — storage keys and helpers

### Acceptance criteria

- Cannot publish until all 6 slots are filled and description is not empty.
- On publish, a `Poll` object is created with `status: "open"`, `votes: {A:0,B:0}`, empty `voters` and persisted.
- Success flow navigates to `/#/vote`.

### Error handling

- If catalog fails to load: show empty slots but allow selection once available.

### Future (P1+)

- Slot-specific category filtering, media uploads, ML assist.
