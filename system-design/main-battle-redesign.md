## Battle Screen Redesign (Vote)

### Purpose

Create a polished, mobile-first battle screen matching the provided figma. Focus on visual structure and interaction scaffolding; keep Save/Expand non-functional for now. Keep parity with existing flow behavior for selection and submit enabling.

### High-level Goals

- Dark near-black app background.
- Top header row: back button on the left and category dropdown on the right. Defaults to “All”. No data filtering yet.
- Two light-grey fit cards (A top, B bottom). Top card shows media stack on the left; bottom card mirrors with media on the right.
- Each card: Save button (top-right) and Expand button (below it). No functionality yet.
- White circular “Versus” badge centered between cards.
- Submit button pinned at bottom; disabled until a side is selected.
- After submit: selected card expands to fill the main viewport; bottom submit morphs into a results percentage bar with a Next button.

### Non-functional Constraints

- Use React with `@shopify/shop-minis-react` components/hooks where available (Select, Button, Icon, Progress/Bar, Sheet/Modal primitives). Only custom-build when the SDK does not provide the needed UI.
- Tailwind CSS v4 for all styling; mobile-only layout.
- Performance: avoid layout thrash; prefer CSS transitions; images lazy-loaded.

---

### Layout and Visual Spec

- **Screen background**: `bg-zinc-950` (near-black). Page padding `px-4 pb-20 pt-3`.
- **Header row** (back + dropdown):
  - Row: `flex items-center gap-3`.
  - Back button: circular, `size-10 rounded-full bg-zinc-800 text-zinc-100 grid place-items-center` (icon: chevron-left).
  - Dropdown capsule: `rounded-full bg-zinc-800 text-zinc-100 h-11 px-4 flex-1 flex items-center`.
  - Dropdown component: prefer SDK `Select`; fallback: native `<select>` styled. Default value: “All categories”. Options placeholder: All, Streetwear, Casual, Formal, Athleisure.
- **Battle area**: two stacked panels with a centered “Versus” badge overlapping.
  - Panel container: `rounded-xl bg-zinc-800 p-3 relative` with soft inner card.
  - Inner light card: `bg-zinc-200 rounded-3xl` representing the fit media region.
  - Card A: media stack aligned left; Card B: media stack aligned right.
  - Panel spacing: `mt-3` above top panel, `mt-14` above bottom (to account for VS badge overlap).
- **Action cluster** (per panel):
  - Save button: circular, `size-10 rounded-full bg-white/90 text-zinc-900 shadow`, absolute top-right.
  - Expand button: icon-only `size-8 rounded-md bg-zinc-900/70 text-zinc-100` placed below Save with `mt-2`.
- **Versus badge**: centered between panels.
  - Style: `w-20 h-20 rounded-full bg-white text-zinc-900 font-semibold text-sm grid place-items-center ring-8 ring-zinc-900`.
  - Label: “Versus”.
- **Submit bar** (sticky bottom pre-submit):
  - Container: `fixed bottom-4 inset-x-4`.
  - Button states: disabled `bg-zinc-700 text-zinc-400`, enabled `bg-emerald-500 text-white active:bg-emerald-600`.
  - Use SDK `Button` if available.

Color tokens used:

- Background near-black: `zinc-950`, Panels: `zinc-800`, Light cards: `zinc-200`, Text on dark: `zinc-100`, Muted: `zinc-400`.

---

### Post-Submit Animation and Results View

- **Trigger**: User taps Submit after selecting side A or B.
- **Animation**: The selected grey panel smoothly expands to occupy the main viewport area (from under the header to above the bottom bar). Use a layout transition rather than screen swap to feel continuous.
  - Technique: apply a class (e.g., `.animate-expand-to-full`) to the selected `BattleCard` container. The card becomes `position: relative` and its wrapper animates dimensions to fill the available space. Non-selected panel fades out.
  - Performance: GPU-accelerated transforms preferred; avoid animating expensive properties repeatedly.
- **Expanded content**:
  - The inner light region becomes the **big white box** (primary fit view).
  - Below it, render a horizontal carousel of white square thumbnails showing the items in the fit (placeholder rectangles for now). Carousel can be snap-scroll (`overflow-x-auto snap-x`) with `snap-center` items.
- **Bottom morph**: the bottom submit area morphs into a dynamic results bar occupying roughly 70% of the bottom width.
  - Results bar shows the percentage of voters who chose the selected fit (e.g., "64%"), with a fill reflecting that percent.
  - Use SDK `Progress`/`Bar` if available; otherwise a custom progress bar: outer `rounded-full bg-zinc-800`, inner `h-full rounded-full bg-emerald-500` with `style={{ width: '64%' }}`.
  - To the bottom-right, render a `Next` button that loads the next fit battle when pressed.
- **Header in results view**: Back button and dropdown remain visible unchanged.
- **Other controls**: Save and Expand buttons on the expanded card can remain visible (still no-op for this pass).

---

### Component Breakdown

- `VoteBattleScreen` (screen; lives in `src/screens/Vote.tsx`)
  - Renders `HeaderRow` (Back + CategoryDropdown), `BattleCard` x 2, `VersusBadge`, and `SubmitOrResultsBar`.
  - Holds page-level state: `selectedSide: 'A' | 'B' | null`, `category: string`, `phase: 'idle' | 'selected' | 'submitting' | 'results'`, `percentForSelected: number`.
- `HeaderRow`
  - Contains `BackButton` and `CategoryDropdown`.
- `CategoryDropdown`
  - Props: `value`, `onChange(value)`.
- `BackButton`
  - Props: `onPress()`; action: navigate back within the WebView host or history.back().
- `BattleCard`
  - Props: `side: 'A' | 'B'`, `mediaAlignment: 'left' | 'right'`, `isSelected`, `isExpanded` (results phase), `onSelect()`.
- `FitMediaStack`
  - Displays stacked item thumbnails (rectangles for now). In results phase, shows large main white box plus carousel of item squares below.
- `SubmitOrResultsBar`
  - Pre-submit: shows Submit button (disabled/enabled states).
  - Results phase: shows `ResultsPercentBar` (70% width) and `NextButton` on the right.
- `ResultsPercentBar`
  - Props: `percent: number`.
- `NextButton`
  - Props: `onNext()` → loads next open poll.

---

### Interaction and State

- Selecting a card sets `selectedSide` and visually highlights the corresponding `BattleCard` using a `ring-4 ring-emerald-500` on the panel container and `scale-95` on the unselected one.
- Submit button is disabled when `selectedSide === null`.
- On press Submit:
  - `phase` transitions: `selected → submitting` (start expand animation) → `results` (on animation end or short timeout). Compute `percentForSelected` from `poll.votes`.
  - Selected `BattleCard` receives `isExpanded=true`; the other fades out.
  - Bottom bar morphs to `ResultsPercentBar` + `NextButton`.
- On press Next: call `getNextOpenPollForUser(category?)` and reset `phase` to `idle` with cleared selection.

---

### Accessibility and UX

- Hit targets: min 44x44 for Back/Save/Expand.
- Focus styles and ARIA labels for dropdown, Save, Expand, Submit, Next, and progress bar.
- Reduced motion: respect `prefers-reduced-motion` by skipping the expansion animation and crossfading to the results layout.

---

### File Touches (planned)

- `src/screens/Vote.tsx`: reorganize markup into the components outlined; dark background; sticky submit; results morph.
- `src/components/FitCard.tsx`: add props for left/right alignment, selected ring, and expanded results presentation (big white box + items carousel).
- `src/index.css`: keyframes for `.animate-expand-to-full` and reduced-motion guard.

Keep all styling within Tailwind classes; avoid custom CSS unless for keyframes.

---

### Data and Future Wiring (next iteration)

- Category dropdown to filter polls by `category` (if present) by updating `getNextOpenPollForUser(category?: string)` in `src/contexts/PollsContext.tsx`.
- Hook Submit to `voteOnPoll(pollId, side)` with one-vote-per-user enforcement; compute `percentForSelected` as `Math.round((votes[side] / (votes.a + votes.b)) * 100)`.
- Hook Save to `SavedContext` and Expand to a full-screen media sheet.

---

### Acceptance Criteria (UI-only pass)

- Background is dark grey (near-black) across the screen.
- Header shows back button (left) and dropdown (right) in the same horizontal row.
- Two light grey fit areas render; top shows media on left, bottom shows media on right pre-submit.
- Save and Expand controls appear on each card; tapping does nothing.
- Central white “Versus” badge overlaps panels and is visually centered pre-submit.
- Tapping a card selects it; visual highlight appears; Submit enables.
- On Submit, the selected panel expands to fill the main viewport beneath the header; the other panel disappears.
- Expanded view shows a big white box (main fit area) and, below it, a horizontal carousel of white square item tiles.
- The bottom submit area morphs into a results percentage bar occupying ~70% width, displaying the selected share (e.g., 64%).
- A `Next` button appears at the bottom-right; tapping loads the next fit battle.

---

### Rough JSX Structures (for reference)

```tsx
// Pre-submit
<View className="min-h-[100dvh] bg-zinc-950 px-4 pt-3 pb-24">
  <HeaderRow>
    <BackButton />
    <CategoryDropdown value={category} onChange={setCategory} />
  </HeaderRow>

  <BattleCard side="A" mediaAlignment="left" isSelected={selectedSide==='A'} onSelect={() => setSelectedSide('A')} />
  <VersusBadge />
  <BattleCard side="B" mediaAlignment="right" isSelected={selectedSide==='B'} onSelect={() => setSelectedSide('B')} />

  <SubmitOrResultsBar phase={phase} disabled={!selectedSide} onSubmit={handleSubmit} />
</View>

// Results phase (selected expanded)
<View className="min-h-[100dvh] bg-zinc-950 px-4 pt-3 pb-24">
  <HeaderRow>
    <BackButton />
    <CategoryDropdown value={category} onChange={setCategory} />
  </HeaderRow>

  <BattleCard side={selectedSide!} isExpanded mediaAlignment={selectedSide==='A' ? 'left' : 'right'} />

  <SubmitOrResultsBar phase="results">
    <ResultsPercentBar percent={percentForSelected} />
    <NextButton onNext={handleNext} />
  </SubmitOrResultsBar>
</View>
```

---

### Task Checklist (UI-only)

- [ ] Add `HeaderRow` with `BackButton` and `CategoryDropdown`.
- [ ] Implement `BattleCard` expanded mode (big white box + items carousel).
- [ ] Implement expansion animation (`.animate-expand-to-full`) with reduced-motion fallback.
- [ ] Morph bottom bar from Submit button to `ResultsPercentBar` + `NextButton`.
- [ ] Wire `NextButton` to load the next poll (no server writes yet).
- [ ] Ensure Tailwind classes render correctly on mobile viewport in WebView.
