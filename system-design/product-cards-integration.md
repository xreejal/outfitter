### Product Cards Integration Plan

---

#### Goal

- Replace the current fit media layout with Shopify Product Cards rendered in a 2x3 grid per fit (6 cards), while continuing to seed local data from `public/data`.
- Tapping a product card opens the product detail page using the Shop Minis SDK navigation/product APIs.
- Begin integration of Shop Minis product hooks and components without blocking on full backend setup.

---

#### Scope

- Frontend only; keep using local seeds (`/public/data`) and local storage via `src/data/seed-loader.ts`.
- Add product codes to our data so that we can render SDK Product Cards.
- Update `Vote` screen fit card section to display 6 product cards in a 2x3 grid for the active fit.

---

#### Data Model Updates

- Extend `Item` to map to one or more Shopify products.
  - Add a new field on `Item`:
    - `productIds: string[]` (preferred: Shopify GIDs) or `productHandles: string[]` (fallback if handles are easier locally).
  - Rationale: Each fit currently has 3 `itemIds`. With `productIds` length of 2 per item, we can derive 6 total product cards (3 items x 2 products = 6 cards).
- Seeds
  - Continue to use `public/data/catalog.json` for items.
  - Populate each item with 1-2 mock product identifiers (GIDs or handles). These can be random/placeholder now and easily replaced later.
  - No changes to `public/data/polls.json` needed; the existing `fit.itemIds` remain the source for deriving the 6 product cards.
- Types
  - Update `src/types.ts` `Item` interface to include `productIds?: string[]` (or `productHandles?: string[]`).

---

#### SDK Components and Hooks

- Use `@shopify/shop-minis-react` for rendering and navigation.
  - Product card UI: Use the official Product Card component from the SDK if available. If the exact component name differs, wrap the SDK’s product tile component in our `FitCard` replacement.
  - Product data fetching: Use the SDK’s product hooks to resolve `productIds`/`productHandles` into display-ready data for the card (title, image, price). Name TBD based on the SDK (e.g., a hook that accepts product GIDs/handles).
  - Navigation: Use the SDK navigation/product API to open product detail when a card is tapped (e.g., `openProduct(productId)` or equivalent). If the exact API differs, create a thin `navigateToProduct(productId)` abstraction so we can swap implementations.

---

#### UI/UX Changes (Mobile-first, Tailwind v4)

- Replace `FitMediaStack`’s non-expanded grid with a 2x3 grid of Product Cards (6 total) for the active fit.
  - Layout: 2 columns x 3 rows; consistent card sizing; rounded corners; touch-friendly spacing.
  - Card content: Product image, title, price (as provided by SDK component/hook), save/like optional in later phase.
  - Tap behavior: Opens product page in-app via SDK navigation.
- Expanded view:
  - Keep the current expand interaction for now, but render the same product grid in expanded mode with more vertical space if beneficial.
- Loading/Fallbacks:
  - While product data loads, show skeleton placeholders matching the grid.
  - If SDK product card cannot render in non-Shop environment, fall back to a simple image/title placeholder (dev mode only), behind a feature flag.

---

#### Interaction Flow

1. `Vote` screen resolves the current poll and active fit (`A` or `B`).
2. For that fit, gather its 3 `itemIds` from the catalog.
3. Flatten `item.productIds` from those 3 items to build a list of 6 product IDs.
4. Render 6 Product Cards using the SDK component/hook data.
5. On tap of a product card, call `navigateToProduct(productId)` which delegates to the SDK to present the product page.

---

#### State and Storage

- Continue using `src/data/seed-loader.ts` and localStorage for catalog/polls.
- Optionally cache resolved product metadata using `useAsyncStorage` for minor performance wins and to minimize repeated fetching during a session. This is a nice-to-have in Phase 2.

---

#### Rollout Plan

- Phase 1: Data + UI skeleton
  - Update `Item` type and seeds to include `productIds` (or `productHandles`).
  - Render a 2x3 grid with placeholders or minimal data (image/title) using the SDK Product Card if available; otherwise show a dev fallback.
  - Log taps or no-op navigation in dev if SDK nav isn’t wired.
- Phase 2: SDK wiring
  - Integrate product hooks to fetch/resolve product data by `productIds`/`productHandles`.
  - Wire `navigateToProduct(productId)` to the SDK to open product detail.
  - Add skeleton loaders and error handling.
- Phase 3: Polish
  - Visual polish of cards, price formatting, truncation, and accessibility labels.
  - Optional: Save/like actions, analytics, and caching via `useAsyncStorage`.

---

#### Acceptance Criteria

- For any open poll, selecting fit A or B shows exactly 6 product cards in a 2x3 grid.
- Tapping a card calls the SDK navigation to open that product page.
- All UI is mobile-optimized, uses Tailwind v4 classes, and respects our existing visual style.
- No backend dependency; all data comes from `/public/data` and the SDK.

---

#### Risks / Notes

- Exact SDK component and hook names for product cards/navigation may differ; we’ll abstract them behind `ProductTile` and `navigateToProduct()` wrappers for flexibility.
- In non-Shop environments, some SDK UI may not render; keep a dev fallback behind a feature flag to avoid blocking local dev.
- Ensure submissions remain within allowed dependency constraints; we only use `@shopify/shop-minis-react` and existing deps.

---

#### Implementation Checklist (for follow-up PRs)

- Update `src/types.ts` `Item` interface with `productIds?: string[]`.
- Augment `public/data/catalog.json` items with `productIds` (2 IDs per item recommended).
- Add `navigateToProduct(productId)` helper using the SDK.
- Replace `FitMediaStack` content with a 2x3 product grid.
- Integrate SDK product hook(s) for data; add skeletons and error states.
- Add minimal analytics/logging for taps (optional).
