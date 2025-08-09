## Outfit Fit Battler — MVP Implementation

### Scope

- Only the “Which fit is better” mode is included.
- No backend; all data is local. We ship seed JSON files and persist runtime mutations in `localStorage`.
- UI built with React + Tailwind CSS v4 and the `@shopify/shop-minis-react` SDK components/hooks where available.
- Mobile-only layout for embedding inside a React Native WebView.

### High-level architecture

- Routing: hash-based routes (`/#/`, `/#/create`, `/#/vote`, `/#/recents`, `/#/saved`) so WebView deep-linking works without server config.
- State: lightweight client state with React context for:
  - `CatalogContext` (read-only catalog items)
  - `PollsContext` (published polls, create, vote, results)
  - `SavedContext` (bookmarks)
  - `UserContext` (single local user id)
- Persistence: load seed data from JSON files on first run, then mirror updates into `localStorage`.
  - Note: we cannot write to bundled JSON at runtime. The app bootstraps from `/public/data/*.json` then uses `localStorage` to store mutations.

### Navigation map

- Landing (`/#/`)
  - Buttons: "choose fits" → `/#/vote`; "fit battles" (disabled for MVP/P1)
  - Bottom nav: Recents → `/#/recents`, Create → `/#/create`, Saved → `/#/saved`
- Create (`/#/create`)
  - Two columns (A and B), each with 3 item slots. Each slot is a circular button that opens Item Picker modal.
  - Text inputs: Name for A, Name for B. Description field for poll.
  - Publish button → validates and creates a poll; success sheet with "Go to battles" → `/#/vote`.
- Vote (`/#/vote`)
  - Shows current poll: two FitCards (A vs B), author + description.
  - User selects one card, presses Submit. Chosen card expands with slide/scale animation to fill container then results are revealed (% for A vs B). "Next battle" button advances to next poll.
  - Bookmark buttons on each FitCard save items to Saved.
- Recents (`/#/recents`)
  - List of polls created by current user with results chips.
- Saved (`/#/saved`)
  - List of bookmarked fits/items.

### File layout (app)

- `src/screens/Landing.tsx`
- `src/screens/Create.tsx`
- `src/screens/Vote.tsx`
- `src/screens/Recents.tsx`
- `src/screens/Saved.tsx`
- `src/components/FitCard.tsx`
- `src/components/ItemPickerModal.tsx`
- `src/components/BottomNav.tsx`
- `src/contexts/{CatalogContext,PollsContext,SavedContext,UserContext}.tsx`
- `src/data/seed-loader.ts` (loads JSON then reconciles with localStorage)

### Data model and JSON schemas

#### Item

```
{
  "id": "item_001",
  "title": "Oversized Wool Coat",
  "imageUrl": "/images/coat1.jpg",
  "price": 18000,           // in cents
  "merchant": "Acme",
  "category": "outerwear"  // simple string for MVP
}
```

#### Fit

```
{
  "id": "fit_a_001",
  "name": "Fit A",
  "itemIds": ["item_001", "item_101", "item_201"]
}
```

#### Poll (Which fit is better)

```
{
  "id": "poll_001",
  "authorId": "user_local",
  "description": "Which for dinner?",
  "fitA": { "id": "fit_a_001", "name": "A", "itemIds": ["item_001","item_101","item_201"] },
  "fitB": { "id": "fit_b_001", "name": "B", "itemIds": ["item_002","item_102","item_202"] },
  "createdAt": 1731000000000,
  "status": "open",               // "open" | "closed"
  "votes": { "A": 0, "B": 0 },  // aggregate counts
  "voters": { }                    // map<userId, "A"|"B"> to enforce one vote per user
}
```

#### Saved

```
{
  "savedFits": [
    {
      "pollId": "poll_001",
      "choice": "A",          // which side the user saved
      "fitId": "fit_a_001",
      "savedAt": 1731000100000
    }
  ]
}
```

#### Recents

- Derived view: all `Poll` where `authorId == user_local` (no separate JSON file needed). For convenience we keep a simple index:

```
{
  "myPollIds": ["poll_001", "poll_007"]
}
```

### Seed data files (read-only)

Place under `public/data/` (so they can be fetched at runtime).

- `public/data/catalog.json` — array<Item>
- `public/data/polls.json` — array<Poll> (can start empty)
- `public/data/index.json` — `{ "myPollIds": [] }`

On first launch:

- If `localStorage['ofb.catalog']` is missing → load from `catalog.json` then store to `ofb.catalog`.
- If `localStorage['ofb.polls']` is missing → load from `polls.json` then store to `ofb.polls`.
- If `localStorage['ofb.index']` is missing → load from `index.json` then store to `ofb.index`.
- `ofb.saved` defaults to `{ savedFits: [] }`.

Storage keys:

- `ofb.catalog`, `ofb.polls`, `ofb.index`, `ofb.saved`, `ofb.user`.

### Core interactions

#### Create → Publish

- Validate: names for A and B, each has 3 items selected, description non-empty.
- Create `Poll` with `status: "open"`, prepend to `ofb.polls` and to `ofb.index.myPollIds`.
- Show success Sheet: "Go to battles" → route `/#/vote`.

#### Vote flow

- Source of truth: `ofb.polls` filtered by `status == "open"` and not yet voted by `user_local`.
- Selecting A or B enables Submit.
- Submit:
  - Record in `poll.voters[user_local]` and increment `votes[A|B]`.
  - Reveal result: compute percentages, animate chosen FitCard to expand.
  - After user taps "Next battle", advance to next eligible poll. If none, show empty state.

#### Bookmarking

- Tapping bookmark on a FitCard adds or removes an entry in `ofb.saved.savedFits` with `{ pollId, choice, fitId, savedAt }`.

### UI components (SDK-first)

Use `@shopify/shop-minis-react` where possible:

- Buttons: `Button`/`PrimaryButton`
- Inputs: `TextField`, `Textarea`
- Overlay: `Sheet`/`Modal`
- List/grid: `List`, `Card`
- Icons: `Bookmark`, `Expand`
  If a component is unavailable in the SDK, fall back to Tailwind + semantic HTML.

### Styling

- Tailwind v4 classes only. Mobile viewport (375–430px logical width).
- Key styles:
  - Circular slot buttons: `size-16 rounded-full border-2 border-black flex items-center justify-center`
  - FitCard: rounded-xl, subtle shadow, `p-4 bg-gray-100`
  - Bottom nav: fixed, safe-area aware, four icons/labels
  - Vote animation: add class `animate-expand` using CSS transitions (scale/translate) or a utility via Tailwind.

### Acceptance criteria (per screen)

#### Landing

- Shows app title and two buttons.
- "choose fits" navigates to Vote; "fit battles" is visibly disabled.
- Bottom nav routes to Recents/Create/Saved.

#### Create

- Two fit columns with 3 slots each. Tapping a slot opens item picker showing ALL catalog items (MVP ignores categories).
- Selecting an item replaces the slot with the item image; re-tapping allows change.
- Name inputs for each fit and a description field present.
- Publish validates required fields; on success, new poll is created and persisted; success sheet offers "Go to battles".

#### Vote

- Displays one poll at a time with author, description, and two fit cards.
- User can bookmark either side independently.
- Selecting a side and submitting triggers an expansion animation of the chosen side, then reveals A/B percentages.
- "Next battle" moves to next poll.

#### Recents

- Lists all polls created by current user with result percentages if closed or post-vote.

#### Saved

- Lists all saved fits. Tapping an entry opens the source poll in Vote view.

### Minimal seed examples

`public/data/catalog.json`

```
[
  { "id": "item_001", "title": "Oversized Wool Coat", "imageUrl": "/images/coat1.jpg", "price": 18000, "merchant": "Acme", "category": "outerwear" },
  { "id": "item_101", "title": "Oxford Shirt", "imageUrl": "/images/shirt1.jpg", "price": 6500, "merchant": "Acme", "category": "tops" },
  { "id": "item_201", "title": "Wide Chino", "imageUrl": "/images/chino1.jpg", "price": 9000, "merchant": "Acme", "category": "bottoms" }
]
```

`public/data/polls.json`

```
[]
```

`public/data/index.json`

```
{ "myPollIds": [] }
```

### Developer tasks (split-friendly)

- Screen: Landing — nav + disabled Fit Battles
- Screen: Create — slot grid, ItemPicker modal, validation, publish
- Screen: Vote — selection, submit, animation, results, next battle, bookmark
- Screen: Recents — list my polls, percentage chips
- Screen: Saved — list saved fits and deep-link to Vote
- Contexts & persistence — seed loader, localStorage CRUD
- BottomNav component — fixed navigation bar

### Open assumptions

- Single local user id `user_local` for MVP.
- Votes are aggregated immediately and stored locally; no concurrency concerns.
- Animation implemented with CSS transitions; can later swap to SDK motion utilities if available.

### Out of scope (confirming)

- Category battles and H2H feed
- Photo uploads, background removal, ML
- Comments and reactions
- Server/backend
