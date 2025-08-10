import { useMemo, useState, useEffect, useRef } from "react";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";
import { useSaved } from "../contexts/SavedContext";
import { useComments } from "../contexts/CommentsContext";
import type { Fit, Poll } from "../types";
import ExpandModal from "../components/ExpandModal";
import {
  ProductCard,
  ProductCardSkeleton,
  useProducts,
} from "@shopify/shop-minis-react";

// Components
function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BottomActionBar({
  phase,
  canSubmit,
  percent,
  isMajority,
  onBack,
  onSubmit,
  onNext,
}: {
  phase:
    | "idle"
    | "selected"
    | "submitting"
    | "expanding"
    | "results"
    | "exiting"
    | "entering";
  canSubmit: boolean;
  percent: number;
  isMajority: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onNext: () => void;
}) {
  const isResults = phase === "results" || phase === "exiting";
  const [animatedWidth, setAnimatedWidth] = useState<number>(100);

  useEffect(() => {
    if (isResults) {
      setAnimatedWidth(100);
      requestAnimationFrame(() => setAnimatedWidth(percent));
    } else {
      setAnimatedWidth(100);
    }
  }, [isResults, percent]);

  return (
    <div className="fixed bottom-4 inset-x-4 flex items-center gap-3">
      {/* Back */}
      <button
        onClick={onBack}
        aria-label="Go back"
        className="size-12 rounded-full bg-zinc-800 text-zinc-100 grid place-items-center"
      >
        <BackIcon />
      </button>

      {/* Center */}
      <div className="flex-1">
        {!isResults ? (
          <button
            disabled={!canSubmit}
            onClick={onSubmit}
            className={`w-full h-12 rounded-full font-medium transition-colors ${canSubmit ? "bg-emerald-500 text-white active:bg-emerald-600" : "bg-zinc-700 text-zinc-400"}`}
          >
            Submit
          </button>
        ) : (
          <div className="relative animate-fade-in">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-center text-xs text-zinc-300 whitespace-nowrap">
              {isMajority
                ? "You were in the majority"
                : "You were not in the majority"}
            </div>
            <div className="rounded-full bg-zinc-800 h-12 relative overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${animatedWidth}%` }}
              />
              {/* Percentage pill to the right of the green bar */}
              <div
                className="absolute transition-all duration-500"
                style={{
                  left: `calc(${animatedWidth}% + 8px)`,
                  top: "50%",
                  transform: "translate(-100%, -50%)",
                }}
              >
                <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-white text-xs font-medium">
                  {percent}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right */}
      {isResults ? (
        <button
          onClick={onNext}
          className="h-12 w-16 rounded-xl bg-emerald-500 text-white font-medium active:bg-emerald-600"
        >
          Next
        </button>
      ) : (
        <div className="w-12" />
      )}
    </div>
  );
}

function HeaderRow({
  navigate,
  category,
  onCategoryChange,
}: {
  navigate?: (path: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-2">
      {/* added vertical padding */}
      <button
        onClick={() => navigate?.("/")}
        className="size-10 rounded-full bg-zinc-800 text-zinc-100 grid place-items-center"
        aria-label="Go back"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="rounded-full bg-zinc-800 text-zinc-100 h-11 px-4 flex-1 flex items-center">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-transparent text-zinc-100 w-full outline-none"
        >
          <option value="all">All categories</option>
          <option value="streetwear">Streetwear</option>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="athleisure">Athleisure</option>
        </select>
      </div>
    </div>
  );
}

function buildProductGid(id: string): string {
  return id.startsWith("gid://shopify/Product/")
    ? id
    : `gid://shopify/Product/${id}`;
}

function FitMediaStack({
  fit,
  alignment,
  isExpanded,
}: {
  fit: Fit;
  alignment: "left" | "right";
  isExpanded?: boolean;
}) {
  const productIds = useMemo(
    () => fit.itemIds.map((id) => buildProductGid(id)),
    [fit.itemIds]
  );
  const { products, loading } = useProducts({ ids: productIds });

  if (isExpanded) {
    return (
      <div className="space-y-4">
        {/* Main fit view - larger grid */}
        <div className="bg-white rounded-2xl p-3">
          <div className="grid grid-cols-2 gap-2">
            {(loading ? productIds : (products ?? []).map((p: any) => p.id))
              .slice(0, 4)
              .map((id: string, idx: number) => (
                <div
                  key={`${String(id)}-${idx}`}
                  className="overflow-hidden rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {loading ? (
                    <ProductCardSkeleton />
                  ) : (
                    <ProductCard
                      product={(products ?? []).find((p: any) => p.id === id)!}
                      onFavoriteToggled={() => {}}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
        {/* Horizontal carousel of product cards */}
        <div className="flex gap-2 overflow-x-auto snap-x pb-2">
          {(loading ? productIds : (products ?? []).map((p: any) => p.id)).map(
            (id: string, idx: number) => (
              <div
                key={`c-${String(id)}-${idx}`}
                className="flex-none w-40 snap-center"
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <ProductCardSkeleton />
                ) : (
                  <ProductCard
                    product={(products ?? []).find((p: any) => p.id === id)!}
                    onFavoriteToggled={() => {}}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // 2x2 grid layout for normal view with fit name pinned top-left
  return (
    <div className="relative">
      {/* Title pinned */}
      <div className="absolute top-3 left-3 z-[5] text-white text-base font-semibold">{`Fit ${fit.name}`}</div>
      <div className="grid grid-cols-2 gap-2 pt-12">
        {(loading ? productIds : (products ?? []).map((p: any) => p.id))
          .slice(0, 4)
          .map((id: string, idx: number) => (
            <div
              key={`${String(id)}-${idx}`}
              className="rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {loading ? (
                <ProductCardSkeleton />
              ) : (
                <ProductCard
                  product={(products ?? []).find((p: any) => p.id === id)!}
                  onFavoriteToggled={() => {}}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

function FitSelectors({
  active,
  selected,
  onChange,
}: {
  active: "A" | "B";
  selected: "A" | "B" | null;
  onChange: (side: "A" | "B") => void;
}) {
  const Button = ({ side }: { side: "A" | "B" }) => {
    const isActive = active === side;
    const isChosen = selected === side;
    return (
      <button
        onClick={() => onChange(side)}
        aria-pressed={isActive}
        className={`flex-1 h-11 rounded-full text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-emerald-600 text-white opacity-100"
            : "bg-zinc-800/70 text-zinc-300 opacity-90"
        }`}
      >
        {`Fit ${side}`}
      </button>
    );
  };
  return (
    <div className="fixed inset-x-4 bottom-24 flex gap-2">
      <Button side="A" />
      <Button side="B" />
    </div>
  );
}

function BattleCard({
  side,
  fit,
  pollId,
  mediaAlignment,
  isSelected,
  isExpanded,
  tall,
  onSelect,
}: {
  side: "A" | "B";
  fit: Fit;
  pollId: string;
  mediaAlignment: "left" | "right";
  isSelected: boolean;
  isExpanded?: boolean;
  tall?: boolean;
  onSelect: () => void;
}) {
  const { isSaved, toggleSave } = useSaved();
  const { listComments, addComment } = useComments();
  const saved = isSaved(pollId, fit.id);
  const [expandOpen, setExpandOpen] = useState(false);
  const [comments, setComments] = useState<
    Array<{ id: string; body: string; author_id: string; created_at: string }>
  >([]);
  const [newComment, setNewComment] = useState("");

  const actionRowPosition = "top-2 right-2";

  useEffect(() => {
    if (!expandOpen) return;
    (async () => {
      try {
        const list = await listComments(fit.id);
        setComments(list);
      } catch {}
    })();
  }, [expandOpen, fit.id, listComments]);

  async function submitComment() {
    const body = newComment.trim();
    if (!body) return;
    try {
      const c = await addComment(fit.id, "user_local", body);
      setComments((prev) => [...prev, c]);
      setNewComment("");
    } catch {}
  }

  return (
    <div
      onClick={onSelect}
      className={`
        rounded-xl bg-zinc-800 p-3 relative transition-all duration-300 ${isExpanded ? "h-[82dvh]" : "h-[75dvh]"}
        ${!isSelected && !isExpanded ? "scale-95" : ""}
      `}
    >
      <div className="animate-fade-in">
        <FitMediaStack
          fit={fit}
          alignment={mediaAlignment}
          isExpanded={isExpanded}
        />
      </div>

      {/* Action buttons top-right (horizontal) */}
      <div
        className={`absolute ${actionRowPosition} z-20 flex items-center gap-2`}
      >
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await toggleSave(pollId, fit.id, side);
          }}
          className={`h-10 w-10 grid place-items-center active:scale-95 transition-all duration-200 rounded-full ${
            saved 
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
              : "text-zinc-100 hover:bg-white/10"
          }`}
          aria-label={saved ? "Unsave fit" : "Save fit"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            className="transition-all duration-200"
          >
            <path d="M3 5v8l5-3 5 3V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpandOpen(true);
          }}
          className="h-10 w-10 grid place-items-center text-zinc-100 active:scale-95 transition-transform"
          aria-label="Expand fit"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              d="M3 6V3h3M13 10v3h-3M6 13H3v-3M10 3h3v3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Removed full-card overlay to allow ProductCard interactions */}

      <ExpandModal open={expandOpen} onClose={() => setExpandOpen(false)}>
        <div className="p-4 space-y-4">
          <div className="text-white text-base font-semibold">Comments</div>
          <div className="space-y-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className="text-sm text-zinc-200 bg-zinc-800/50 rounded-lg p-2"
              >
                {c.body}
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-sm text-zinc-400">No comments yet.</div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-zinc-800 text-white rounded-lg px-3 py-2 outline-none"
              placeholder="Add a comment"
            />
            <button
              onClick={submitComment}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white"
            >
              Post
            </button>
          </div>
        </div>
      </ExpandModal>
    </div>
  );
}

function VersusBadge() {
  return (
    <div className="flex justify-center my-0.5">
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white/90 bg-white/10 tracking-wide">
        versus
      </span>
    </div>
  );
}

function ResultsPercentBar({ percent }: { percent: number }) {
  return (
    <div className="flex-1 max-w-[70%]">
      <div className="rounded-full bg-zinc-800 h-12 relative overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
          {percent}%
        </div>
      </div>
    </div>
  );
}

// Main component
export default function Vote({
  navigate,
}: {
  navigate?: (path: string) => void;
}) {
  const { getNextOpenPollForUser, voteOnPoll } = usePolls();
  const user = useUser();

  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>("A");
  const [phase, setPhase] = useState<
    | "idle"
    | "selected"
    | "submitting"
    | "expanding"
    | "results"
    | "exiting"
    | "entering"
  >("selected");
  const [percentForSelected, setPercentForSelected] = useState(0);
  const [currentPoll, setCurrentPoll] = useState<
    ReturnType<typeof Object> | any
  >(null);
  const [resultPoll, setResultPoll] = useState<Poll | null>(null);
  const [prefetchedNext, setPrefetchedNext] = useState<Poll | null>(null);

  useEffect(() => {
    (async () => {
      const first = await getNextOpenPollForUser(user.id);
      setCurrentPoll(first ?? null);
    })();
  }, [user.id, getNextOpenPollForUser]);
  const expandedRef = useRef<HTMLDivElement | null>(null);

  // Ensure current poll syncs once providers finish loading
  useEffect(() => {
    (async () => {
      if (!currentPoll && phase !== "results") {
        const next = await getNextOpenPollForUser(user.id);
        setCurrentPoll(next ?? null);
      }
    })();
  }, [currentPoll, phase, user.id, getNextOpenPollForUser]);

  // When switching tabs, auto-select that side and mark phase selected
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  useEffect(() => {
    setSelectedSide(activeTab);
    setPhase("selected");
  }, [activeTab]);

  // Prefetch next unvoted while showing results
  useEffect(() => {
    if (phase !== "results") return;
    let cancelled = false;
    (async () => {
      try {
        const next = await getNextOpenPollForUser(user.id);
        if (!cancelled && next && next.id !== (resultPoll ?? currentPoll)?.id) {
          setPrefetchedNext(next);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, user.id, getNextOpenPollForUser, currentPoll, resultPoll]);

  const totals = useMemo(() => {
    const p = currentPoll;
    if (!p) return { A: 0, B: 0 };
    const total = p.votes.A + p.votes.B || 1;
    return {
      A: Math.round((p.votes.A / total) * 100),
      B: Math.round((p.votes.B / total) * 100),
    };
  }, [currentPoll]);

  function handleSelect(side: "A" | "B") {
    setSelectedSide(side);
    setPhase("selected");
  }

  async function handleSubmit() {
    if (!selectedSide || !currentPoll) return;

    const optimistic: Poll = {
      ...currentPoll,
      votes: {
        ...currentPoll.votes,
        [selectedSide]: (currentPoll.votes[selectedSide] ?? 0) + 1,
      },
    } as Poll;
    const optimisticTotal = optimistic.votes.A + optimistic.votes.B || 1;
    const optimisticPercent = Math.round(
      (optimistic.votes[selectedSide] / optimisticTotal) * 100
    );
    setResultPoll(optimistic);
    setPercentForSelected(optimisticPercent);
    setPhase("results");

    try {
      const updated = await voteOnPoll(currentPoll.id, selectedSide, user.id);
      if (updated) {
        const newTotal = updated.votes.A + updated.votes.B || 1;
        const percent = Math.round(
          (updated.votes[selectedSide] / newTotal) * 100
        );
        setResultPoll(updated);
        setPercentForSelected(percent);
      }
    } catch (e) {
      console.error("Vote failed", e);
    }
  }

  async function handleNext() {
    const nextFromPrefetch = prefetchedNext;
    setPrefetchedNext(null);

    setCurrentPoll(nextFromPrefetch ?? null);
    setResultPoll(null);
    setSelectedSide(null);
    setPercentForSelected(0);
    setPhase("idle");

    if (!nextFromPrefetch) {
      getNextOpenPollForUser(user.id)
        .then((upcoming) => {
          setCurrentPoll(upcoming ?? null);
        })
        .catch(() => {});
    } else {
      // Prefetch subsequent next in background
      getNextOpenPollForUser(user.id)
        .then((upcoming) => {
          if (upcoming && upcoming.id !== nextFromPrefetch.id) {
            setPrefetchedNext(upcoming);
          }
        })
        .catch(() => {});
    }
  }

  const isResultsPhase = phase === "results";

  if (!currentPoll && !isResultsPhase) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 px-4 pt-3 pb-24">
        <HeaderRow
          navigate={navigate}
          category="all"
          onCategoryChange={(category) => {}}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-zinc-400 text-center">
            No open battles. Create one!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 px-4 pt-2 pb-20">
      {/* Poll Description Header */}
      <div className="flex items-center justify-between py-3 px-1">
        <button
          onClick={() => navigate?.("/")}
          className="size-10 rounded-full bg-zinc-800 text-zinc-100 grid place-items-center"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-white text-lg font-medium">
            {currentPoll?.description || "Vote on this outfit"}
          </h2>
        </div>
        <div className="size-10" /> {/* Spacer for centering */}
      </div>
      
      {!isResultsPhase ? (
        <>
          <div className="mt-2">
            <BattleCard
              side={activeTab}
              fit={activeTab === "A" ? currentPoll.fitA : currentPoll.fitB}
              pollId={currentPoll.id}
              mediaAlignment={activeTab === "A" ? "left" : "right"}
              isSelected={selectedSide === activeTab}
              tall
              onSelect={() => handleSelect(activeTab)}
            />
          </div>
        </>
      ) : (
        <>
          {/* Poll Description Header for Results */}
          <div className="flex items-center justify-between py-3 px-1">
            <button
              onClick={() => navigate?.("/")}
              className="size-10 rounded-full bg-zinc-800 text-zinc-100 grid place-items-center"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-white text-lg font-medium">
                {(resultPoll ?? currentPoll)?.description || "Vote on this outfit"}
              </h2>
            </div>
            <div className="size-10" /> {/* Spacer for centering */}
          </div>
          
          <div className="mt-2" ref={expandedRef}>
          <BattleCard
            side={selectedSide!}
            fit={
              selectedSide === "A"
                ? (resultPoll ?? currentPoll).fitA
                : (resultPoll ?? currentPoll).fitB
            }
            pollId={(resultPoll ?? currentPoll).id}
            mediaAlignment={selectedSide === "A" ? "left" : "right"}
            isSelected={true}
            isExpanded={true}
            onSelect={() => {}}
          />
          </div>
        </>
      )}

      {!isResultsPhase && (
        <FitSelectors
          active={activeTab}
          selected={selectedSide}
          onChange={(s) => setActiveTab(s)}
        />
      )}
      <BottomActionBar
        phase={phase}
        canSubmit={!!selectedSide}
        percent={percentForSelected}
        isMajority={percentForSelected >= 50}
        onBack={() => navigate?.("/")}
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    </div>
  );
}
