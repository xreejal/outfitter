import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Fit, Poll } from "../types";
import { supabase } from "../lib/supabase";

interface CreatePollInput {
  description: string;
  fitA: Fit;
  fitB: Fit;
}

interface PollsContextValue {
  polls: Poll[];
  createPoll: (input: CreatePollInput, authorId: string) => Promise<Poll>;
  voteOnPoll: (
    pollId: string,
    choice: "A" | "B",
    userId: string
  ) => Promise<Poll | undefined>;
  getNextOpenPollForUser: (userId: string) => Promise<Poll | undefined>;
  closePoll: (pollId: string) => Promise<void>;
  generateRandomBattle: () => Promise<Poll>;
}

const PollsContext = createContext<PollsContextValue>({
  polls: [],
  createPoll: async () => {
    throw new Error("not ready");
  },
  voteOnPoll: async () => undefined,
  getNextOpenPollForUser: async () => undefined,
  closePoll: async () => {},
  generateRandomBattle: async () => {
    throw new Error("not ready");
  },
});

export function usePolls(): PollsContextValue {
  return useContext(PollsContext);
}

function mapDbToPoll(row: any, fitA: any, fitB: any): Poll {
  const votesA = Number(row.votes_a ?? 0);
  const votesB = Number(row.votes_b ?? 0);
  const createdAt = new Date(row.created_at as string).getTime();
  const fitAIds = Array.isArray(fitA?.products)
    ? fitA.products.map((p: any) => String(p.id))
    : [];
  const fitBIds = Array.isArray(fitB?.products)
    ? fitB.products.map((p: any) => String(p.id))
    : [];
  return {
    id: String(row.id),
    authorId: String(row.author_id ?? ""),
    description: String(row.description ?? ""),
    fitA: {
      id: String(fitA?.id ?? ""),
      name: String(fitA?.name ?? "A"),
      itemIds: fitAIds,
    },
    fitB: {
      id: String(fitB?.id ?? ""),
      name: String(fitB?.name ?? "B"),
      itemIds: fitBIds,
    },
    createdAt,
    status: row.status === "closed" ? "closed" : "open",
    votes: { A: votesA, B: votesB },
    voters: {},
  };
}

export function PollsProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<Poll[]>([]);

  const refreshRecent = useCallback(async () => {
    // Load a small recent window for Recents screen
    const { data: published, error } = await supabase
      .from("published_battles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return;

    const fitsNeeded = new Set<string>();
    (published ?? []).forEach((p) => {
      fitsNeeded.add(p.fit_a_id);
      fitsNeeded.add(p.fit_b_id);
    });

    const fitIds = Array.from(fitsNeeded);
    const fitsById = new Map<string, any>();
    if (fitIds.length > 0) {
      const { data: fits } = await supabase
        .from("fits")
        .select("*")
        .in("id", fitIds);
      (fits ?? []).forEach((f: any) => fitsById.set(f.id, f));
    }

    const mapped = (published ?? []).map((p) =>
      mapDbToPoll(p, fitsById.get(p.fit_a_id), fitsById.get(p.fit_b_id))
    );
    setPolls(mapped);
  }, []);

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent]);

  const api = useMemo<PollsContextValue>(
    () => ({
      polls,
      createPoll: async (
        input: CreatePollInput,
        authorId: string
      ): Promise<Poll> => {
        const fitPayload = (f: Fit) => ({
          name: f.name,
          description: (f as any).description ?? "",
          total_price_cents: (f as any).totalPriceCents ?? 0,
          products: (f.itemIds ?? []).map((id: string) => ({
            id,
            price_cents: 0,
          })),
        });

        const { data: fitA, error: fitAErr } = await supabase
          .from("fits")
          .insert(fitPayload(input.fitA))
          .select("*")
          .single();
        if (fitAErr) throw fitAErr;

        const { data: fitB, error: fitBErr } = await supabase
          .from("fits")
          .insert(fitPayload(input.fitB))
          .select("*")
          .single();
        if (fitBErr) throw fitBErr;

        const { data: pub, error: pubErr } = await supabase
          .from("published_battles")
          .insert({
            author_id: authorId,
            description: input.description,
            fit_a_id: fitA.id,
            fit_b_id: fitB.id,
          })
          .select("*")
          .single();
        if (pubErr) throw pubErr;

        const created = mapDbToPoll(pub, fitA, fitB);
        setPolls((prev) => [created, ...prev]);
        return created;
      },
      voteOnPoll: async (
        pollId: string,
        choice: "A" | "B",
        userId: string
      ): Promise<Poll | undefined> => {
        // First try the pipeline schema: published_id + choice
        const primary = await supabase
          .from("votes")
          .insert({ published_id: pollId, user_id: userId, choice })
          .select("id")
          .single();

        // Handle uniqueness (already voted)
        if (primary.error && (primary.error as any).code === "23505") {
          // noop, proceed to fetch updated row
        } else if (primary.error) {
          // If missing columns (older schema), fall back to legacy insert using battle_id + chosen_fit_id
          const missingColumn =
            (primary.error as any).code === "PGRST204" ||
            /column .* does not exist/i.test(
              String((primary.error as any).message ?? "")
            ) ||
            /Could not find/.test(String((primary.error as any).message ?? ""));

          if (missingColumn) {
            // Resolve chosen_fit_id from published_battles
            const { data: pubIds } = await supabase
              .from("published_battles")
              .select("fit_a_id, fit_b_id")
              .eq("id", pollId)
              .single();
            const chosenFitId =
              choice === "A" ? pubIds?.fit_a_id : pubIds?.fit_b_id;

            const legacy = await supabase
              .from("votes")
              .insert({
                battle_id: pollId,
                user_id: userId,
                chosen_fit_id: chosenFitId,
              })
              .select("id")
              .single();
            if (legacy.error && (legacy.error as any).code !== "23505") {
              throw legacy.error as any;
            }
          } else {
            // Some other error
            throw primary.error as any;
          }
        }

        // Fetch updated published row for counters
        const { data: pub } = await supabase
          .from("published_battles")
          .select("*")
          .eq("id", pollId)
          .single();
        if (!pub) return undefined;

        // load fits
        const [fitA, fitB] = await Promise.all([
          supabase.from("fits").select("*").eq("id", pub.fit_a_id).single(),
          supabase.from("fits").select("*").eq("id", pub.fit_b_id).single(),
        ]);

        const updated = mapDbToPoll(pub, fitA.data, fitB.data);
        setPolls((prev) => {
          const idx = prev.findIndex((p) => p.id === pollId);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = updated;
          return next;
        });
        return updated;
      },
      getNextOpenPollForUser: async (
        userId: string
      ): Promise<Poll | undefined> => {
        const { data: published, error } = await supabase
          .from("published_battles")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) return undefined;

        // Try new schema first
        const votedNew = await supabase
          .from("votes")
          .select("published_id")
          .eq("user_id", userId);

        let votedSet = new Set<string>();
        if (!votedNew.error) {
          votedSet = new Set(
            (votedNew.data ?? []).map((v: any) => v.published_id)
          );
        } else {
          // Fallback to legacy schema (battle_id)
          const votedLegacy = await supabase
            .from("votes")
            .select("battle_id")
            .eq("user_id", userId);
          if (!votedLegacy.error) {
            votedSet = new Set(
              (votedLegacy.data ?? []).map((v: any) => v.battle_id)
            );
          }
        }

        const candidate = (published ?? []).find((b) => !votedSet.has(b.id));
        if (!candidate) return undefined;

        const [fitA, fitB] = await Promise.all([
          supabase
            .from("fits")
            .select("*")
            .eq("id", candidate.fit_a_id)
            .single(),
          supabase
            .from("fits")
            .select("*")
            .eq("id", candidate.fit_b_id)
            .single(),
        ]);

        return mapDbToPoll(candidate, fitA.data, fitB.data);
      },
      closePoll: async (pollId: string): Promise<void> => {
        const { error } = await supabase
          .from("published_battles")
          .update({ status: "closed" })
          .eq("id", pollId);
        if (error) throw error;
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? { ...p, status: "closed" } : p))
        );
      },
      generateRandomBattle: async (): Promise<Poll> => {
        // Placeholder: not implemented under Supabase-backed flow
        throw new Error(
          "generateRandomBattle not supported under Supabase-backed flow"
        );
      },
    }),
    [polls]
  );

  return <PollsContext.Provider value={api}>{children}</PollsContext.Provider>;
}
