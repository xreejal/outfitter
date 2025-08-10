## Publish → Vote Pipeline (Supabase, No RLS, Plus Per‑Fit Comments)

### Scope & Goals

- Replace fake polls/localStorage with a simple hosted DB using Supabase (Postgres) with RLS disabled for MVP.
- Persist published battles in table `published_battles`.
- Persist user votes in table `votes` with uniqueness protection per `(published_id, user_id)`.
- Persist per‑fit comments in table `fit_comments`.
- Introduce a normalized `fits` table and reference `fit_a_id`/`fit_b_id` from `published_battles`.
- Denormalize vote tallies on `published_battles` as `votes_a` and `votes_b` to avoid recomputation.
- Keep using `@shopify/shop-minis-react` components for product UI; prefer Shopify product ids for product references.
- Mobile-first, Tailwind v4, React, designed for WebView.

Note: Local JSON files under `/public/data` are no longer used for publish/vote/comments. We will continue to seed `catalog` locally (or swap to Shopify SDK later) but move publish/vote to Supabase.

### High-level Architecture

- Routing: existing hash routes (e.g., `/#/create`, `/#/vote`).
- Contexts:
  - Replace `PollsContext` internal storage with Supabase-backed CRUD while keeping the same API shape where possible:
    - `createPoll(input, authorId)` → insert `fits` A & B, then `published_battles`
    - `voteOnPoll(pollId, choice, userId)` → insert into `votes` with unique constraint; counters maintained on `published_battles`
    - `getNextOpenPollForUser(userId)` → query `published_battles` minus user’s voted set
    - `closePoll(pollId)` → update `published_battles.status = 'closed'`
  - Add a lightweight `CommentsContext` for `fit_comments` with:
    - `listComments(fitId)`
    - `addComment(fitId, authorId, body)`
- Persistence: Supabase Postgres with RLS disabled on these tables for MVP (explicitly set RLS = OFF).
- Rendering:
  - Vote reads from `published_battles` joined with `fits` A & B; uses `votes_a`/`votes_b` for tallies.
  - Render fits with Shopify `ProductCard` wherever possible. Fallback to local `catalog` items until Shopify id resolution is wired.
- Realtime:
  - Subscribe to `votes` (or `published_battles`) to update tallies; subscribe to `fit_comments` for comments.

### Database Schema (SQL, run in Supabase SQL editor)

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Fits (normalized)
-- products: JSONB array of product objects, e.g. [{"id":"gid://shopify/Product/...","price_cents":1299}]
create table if not exists public.fits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  total_price_cents integer not null default 0,
  products jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint products_is_array check (jsonb_typeof(products) = 'array')
);
create index if not exists idx_fits_created_at on public.fits (created_at desc);

-- Published battles
create table if not exists public.published_battles (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,
  description text not null,
  fit_a_id uuid not null references public.fits(id) on delete restrict,
  fit_b_id uuid not null references public.fits(id) on delete restrict,
  -- denormalized vote counters for fast UI
  votes_a integer not null default 0,
  votes_b integer not null default 0,
  status text not null default 'open' check (status in ('open','closed')),
  product_snapshots jsonb, -- optional resiliency at publish time
  created_at timestamptz not null default now()
);
create index if not exists idx_published_created_at on public.published_battles (created_at desc);

-- Votes (one per user per published battle)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  published_id uuid not null references public.published_battles(id) on delete cascade,
  user_id text not null,
  choice text not null check (choice in ('A','B')),
  created_at timestamptz not null default now(),
  unique (published_id, user_id)
);
create index if not exists idx_votes_published_id on public.votes (published_id);
create index if not exists idx_votes_user_id on public.votes (user_id);

-- Per-fit comments
create table if not exists public.fit_comments (
  id uuid primary key default gen_random_uuid(),
  fit_id uuid not null references public.fits(id) on delete cascade,
  author_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_fit on public.fit_comments (fit_id);
create index if not exists idx_comments_author on public.fit_comments (author_id);

-- Disable RLS for MVP (explicit)
alter table public.fits disable row level security;
alter table public.published_battles disable row level security;
alter table public.votes disable row level security;
alter table public.fit_comments disable row level security;

-- Optional: triggers to maintain denormalized counters on published_battles
-- Increment on INSERT into votes; decrement on DELETE (if ever supported)
create or replace function public.update_vote_counters() returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    if (new.choice = 'A') then
      update public.published_battles set votes_a = votes_a + 1 where id = new.published_id;
    elsif (new.choice = 'B') then
      update public.published_battles set votes_b = votes_b + 1 where id = new.published_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    if (old.choice = 'A') then
      update public.published_battles set votes_a = greatest(0, votes_a - 1) where id = old.published_id;
    elsif (old.choice = 'B') then
      update public.published_battles set votes_b = greatest(0, votes_b - 1) where id = old.published_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

-- Create triggers (idempotent)
drop trigger if exists trg_votes_update_counters_ins on public.votes;
create trigger trg_votes_update_counters_ins
  after insert on public.votes
  for each row execute function public.update_vote_counters();

drop trigger if exists trg_votes_update_counters_del on public.votes;
create trigger trg_votes_update_counters_del
  after delete on public.votes
  for each row execute function public.update_vote_counters();
```

Data model aligns to existing UI types; a “poll” corresponds to a row in `published_battles` joined with two `fits`.

- `fits.products` JSON structure example:
  ```json
  [
    { "id": "<shopifyProductId>", "price_cents": 1299 },
    { "id": "<shopifyProductId>", "price_cents": 3599 }
  ]
  ```

### Environment & Client Setup

- Add env vars (Vite):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Create `src/lib/supabase.ts`:

  ```ts
  import { createClient } from "@supabase/supabase-js";

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  });
  ```

### API Usage Patterns (mapping to current context methods)

- createPoll (publish):

  ```ts
  async function createPoll(
    { description, fitA, fitB }: { description: string; fitA: Fit; fitB: Fit },
    authorId: string
  ) {
    // Fit payloads: compute total_price_cents and products[] on client
    const fitPayload = (f: Fit) => ({
      name: f.name,
      description: f.description ?? "",
      total_price_cents: f.totalPriceCents ?? 0,
      products: (f.itemIds ?? []).map((id: string) => ({ id, price_cents: 0 })),
    });

    const { data: fitAData, error: fitAErr } = await supabase
      .from("fits")
      .insert(fitPayload(fitA))
      .select("*")
      .single();
    if (fitAErr) throw fitAErr;
    const { data: fitBData, error: fitBErr } = await supabase
      .from("fits")
      .insert(fitPayload(fitB))
      .select("*")
      .single();
    if (fitBErr) throw fitBErr;

    const { data: pub, error: pubErr } = await supabase
      .from("published_battles")
      .insert({
        author_id: authorId,
        description,
        fit_a_id: fitAData.id,
        fit_b_id: fitBData.id,
      })
      .select("*")
      .single();
    if (pubErr) throw pubErr;

    return { published: pub, fitA: fitAData, fitB: fitBData };
  }
  ```

- voteOnPoll:

  ```ts
  async function voteOnPoll(
    publishedId: string,
    choice: "A" | "B",
    userId: string
  ) {
    const { data, error } = await supabase
      .from("votes")
      .insert({ published_id: publishedId, user_id: userId, choice })
      .select("*")
      .single();
    // Unique constraint -> PostgREST code 23505
    if (error && error.code !== "23505") throw error;
    return data ?? null; // counters updated via trigger
  }
  ```

- getNextOpenPollForUser (join fits, filter out already voted):

  ```ts
  async function getNextOpenPollForUser(userId: string) {
    const { data: published, error } = await supabase
      .from("published_battles")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;

    const { data: voted } = await supabase
      .from("votes")
      .select("published_id")
      .eq("user_id", userId);
    const votedSet = new Set((voted ?? []).map((v) => v.published_id));

    // For the first unvoted, fetch fits
    const candidate = (published ?? []).find((b) => !votedSet.has(b.id));
    if (!candidate) return undefined;

    const [fitA, fitB] = await Promise.all([
      supabase.from("fits").select("*").eq("id", candidate.fit_a_id).single(),
      supabase.from("fits").select("*").eq("id", candidate.fit_b_id).single(),
    ]);

    return { ...candidate, fitA: fitA.data, fitB: fitB.data };
  }
  ```

- closePoll:

  ```ts
  async function closePoll(publishedId: string) {
    const { error } = await supabase
      .from("published_battles")
      .update({ status: "closed" })
      .eq("id", publishedId);
    if (error) throw error;
  }
  ```

- comments:

  ```ts
  async function listComments(fitId: string) {
    const { data, error } = await supabase
      .from("fit_comments")
      .select("*")
      .eq("fit_id", fitId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async function addComment(fitId: string, authorId: string, body: string) {
    const { data, error } = await supabase
      .from("fit_comments")
      .insert({ fit_id: fitId, author_id: authorId, body })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }
  ```

### Tallies & Percentages

- Use denormalized counters: `votes_a` and `votes_b` on `published_battles`.
- Percent calculation: `percent = round((votes_side / greatest(1, votes_a + votes_b)) * 100)`.
- Optional validation job can reconcile counters from `votes` if needed.

### Realtime Subscriptions

- Tallies: Subscribe to either `votes` (and refetch the battle) or directly to `published_battles` updates for the specific `id` to get `votes_a`/`votes_b` changes.
  ```ts
  const pubChannel = supabase
    .channel("pub_" + publishedId)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "published_battles",
        filter: `id=eq.${publishedId}`,
      },
      (payload) => {
        // payload.new has votes_a / votes_b
      }
    )
    .subscribe();
  ```
- Comments: subscribe to `fit_comments` per `fit_id`.

### User Identity

- Continue to use `UserContext` (`user_local`) for development.
- If Shopify minis exposes a buyer/session id, prefer that for `author_id` and `user_id`.
- Uniqueness is enforced in DB for `(published_id, user_id)`; counters are managed by triggers.

### Product Resolution in Vote

- Prefer minis SDK hooks for product lookups by id; else use `product_snapshots` stored in `published_battles` or the `fits.products` entries to build `ProductCard` props.
- If neither resolves, render existing image/title fallback and progressively enhance when data is available.

### UI Layout

- Keep existing `Vote` screen layout (2x2 grid normal state, expanded stack) and action buttons.
- Embed `ProductCard` tiles inside grid cells sized to fit.
- Add a comments sheet in expanded view with per-fit thread (uses `CommentsContext`).

### Migration Plan

- Phase 1 (MVP, No RLS):
  - Create Supabase project and run the SQL above.
  - Add `src/lib/supabase.ts` and env vars.
  - Refactor `PollsContext` methods to call Supabase; adapt in-memory mapping so existing `Fit` type gets `itemIds` from `fits.products[].id`.
  - Update `seed-loader` to stop loading `ofb.polls` and `ofb.index`; leave `ofb.catalog` and `ofb.user` for now.
  - Implement initial comments list/add in expanded view (fit-scoped UI).
- Phase 2:
  - Add realtime updates for `published_battles` and `fit_comments`.
  - Replace local `catalog` with Shopify minis product hooks; consider denormalizing snapshots on publish.
  - Introduce pagination/windowing for published items.

### Error Handling & Performance

- Handle insert conflicts on votes (`23505`) as already-voted no-ops.
- Debounce comment submissions; trim and validate non-empty bodies.
- Wrap Supabase calls in try/catch; show lightweight toasts.
- Indexes added for main access paths; use `limit` windows on feed queries.

### Testing Plan

- Create → Publish inserts two `fits` rows and one `published_battles` row.
- Vote inserts into `votes` once per user per battle; counters increment correctly.
- Comments insert/list per `fit_id`; realtime append works when enabled.
- Empty states: no published, all voted.

### Security Notes (MVP)

- RLS is explicitly disabled for speed of development. This is acceptable for a prototype in a trusted environment (e.g., embedded WebView during testing). Do not ship broadly without enabling RLS and appropriate policies.
