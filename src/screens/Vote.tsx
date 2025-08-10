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
    <>
      {/* Fixed Footer with Submit/Results Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-white/20 p-4 z-10">
        {!isResults ? (
          <button
            disabled={!canSubmit}
            onClick={onSubmit}
            className={`w-full font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
              canSubmit
                ? 'glass-card border border-white/20 text-white hover:bg-white/10'
                : 'glass-card border border-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        ) : (
          <div className="relative animate-fade-in">
            <div className="mb-2 text-center text-xs text-white/80">
              {isMajority
                ? "You were in the majority"
                : "You were not in the majority"}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="rounded-full glass-card border border-white/20 h-12 relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gray-600 transition-all duration-500"
                    style={{ width: `${animatedWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                    {percent}%
                  </div>
                </div>
              </div>
              <button
                onClick={onNext}
                className="h-12 w-16 rounded-xl glass-card text-white font-medium border border-white/20 hover:bg-white/10 active:bg-white/20"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
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
        <div className="glass-card border border-white/20 rounded-2xl p-3">
          <div className="grid grid-cols-2 gap-2 [&_*]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_span]:!text-white">
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
        <div className="flex gap-2 overflow-x-auto snap-x pb-2 [&_*]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_span]:!text-white">
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
      <div className="absolute top-1 left-3 z-[5] text-white text-base font-bold">{`Fit ${fit.name}`}</div>
      <div className="grid grid-cols-2 gap-2 pt-12 [&_*]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_span]:!text-white">
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
        className={`flex-1 h-7 rounded-full text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-gray-700 text-white opacity-100"
            : "glass-card text-white/80 opacity-90 border border-white/20"
        }`}
      >
        {` Pick Fit ${side}`}
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
        rounded-xl glass-card border border-white/20 p-3 relative transition-all duration-300 ${isExpanded ? "h-[75dvh]" : "h-[68dvh]"}
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
              ? "bg-gray-600 text-white shadow-lg shadow-gray-600/25" 
              : "text-white hover:bg-white/10 glass-card border border-white/20"
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
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            setExpandOpen(true);
          }}
          className="h-10 w-10 grid place-items-center text-white active:scale-95 transition-transform glass-card border border-white/20"
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
        </button> */}
      </div>

      {/* Removed full-card overlay to allow ProductCard interactions */}

      <ExpandModal open={expandOpen} onClose={() => setExpandOpen(false)}>
        <div className="p-4 space-y-4">
          <div className="text-white text-base font-semibold">Comments</div>
          <div className="space-y-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className="text-sm text-white glass-card border border-white/20 rounded-lg p-2"
              >
                {c.body}
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-sm text-white/70">No comments yet.</div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 glass-card text-white rounded-lg px-3 py-2 outline-none border border-white/20"
              placeholder="Add a comment"
            />
            <button
              onClick={submitComment}
              className="px-3 py-2 rounded-lg bg-gray-700 text-white"
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
      <div className="rounded-full glass-card border border-white/20 h-12 relative overflow-hidden">
        <div
          className="h-full rounded-full bg-gray-600 transition-all duration-500"
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
        if (next) {
          setPhase("selected");
          setSelectedSide("A");
          setActiveTab("A");
        }
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
    if (phase !== "results" || !resultPoll) return;
    let cancelled = false;
    (async () => {
      try {
        const next = await getNextOpenPollForUser(user.id);
        if (!cancelled && next && next.id !== resultPoll.id) {
          setPrefetchedNext(next);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, user.id, getNextOpenPollForUser, resultPoll]);

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

    // Set phase to submitting to prevent any interference
    setPhase("submitting");

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
    
    // Clear current poll and set result poll
    setResultPoll(optimistic);
    setCurrentPoll(null); // Clear the current poll immediately
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
      // On error, restore the current poll and go back to selected state
      setCurrentPoll(currentPoll);
      setResultPoll(null);
      setPhase("selected");
    }
  }

  async function handleNext() {
    const nextFromPrefetch = prefetchedNext;
    setPrefetchedNext(null);

    // Reset voting state
    setResultPoll(null);
    setSelectedSide("A"); // Reset to default selection
    setPercentForSelected(0);
    setActiveTab("A"); // Reset active tab to A

    if (nextFromPrefetch) {
      // We have a prefetched next poll
      setCurrentPoll(nextFromPrefetch);
      setPhase("selected");
      
      // Prefetch subsequent next in background
      getNextOpenPollForUser(user.id)
        .then((upcoming) => {
          if (upcoming && upcoming.id !== nextFromPrefetch.id) {
            setPrefetchedNext(upcoming);
          }
        })
        .catch(() => {});
    } else {
      // No prefetched poll, try to get next one
      try {
        const upcoming = await getNextOpenPollForUser(user.id);
        if (upcoming) {
          setCurrentPoll(upcoming);
          setPhase("selected");
        } else {
          // No more polls available
          setCurrentPoll(null);
          setPhase("idle");
        }
      } catch (error) {
        console.error("Failed to get next poll:", error);
        setCurrentPoll(null);
        setPhase("idle");
      }
    }
  }

  const isResultsPhase = phase === "results";

  if (!currentPoll && !resultPoll && !isResultsPhase) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-[100dvh] px-4 pt-3 pb-24">
        <div className="pt-2 pb-2">
          <div className="flex items-center mb-3">
            <button
              onClick={() => navigate?.("/")}
              className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
              aria-label="Go back"
            >
              ←
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="glass-card border border-white/20 p-8 rounded-2xl text-center max-w-sm">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              No more polls at the moment!
            </h3>
            <p className="text-white/70 mb-6">
              You've voted on all available polls. Check back later for new battles or create your own!
            </p>
            <button 
              onClick={() => navigate?.("/create")}
              className="w-full glass-card border border-white/20 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Create New Poll
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if we don't have the required data
  if (!currentPoll && !resultPoll) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-[100dvh] px-4 pt-3 pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/70">Loading poll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-[100dvh] px-4 pt-2 pb-28">
      {/* Poll Description Header */}
      {!isResultsPhase && (
        <div className="py-3 px-1">
          <div className="flex items-center mb-3">
            <button
              onClick={() => navigate?.("/")}
              className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
              aria-label="Go back"
            >
              ←
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-white text-lg font-medium">
              {currentPoll?.description || "Vote on this outfit"}
            </h2>
          </div>
        </div>
      )}
      
      {!isResultsPhase ? (
        <>
          {currentPoll && (
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
          )}
        </>
      ) : (
        <>
          {/* Poll Description Header for Results */}
          <div className="py-3 px-1">
            <div className="flex items-center mb-3">
              <button
                onClick={() => navigate?.("/")}
                className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
                aria-label="Go back"
              >
                ←
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-white text-lg font-medium">
                {resultPoll?.description || "Vote on this outfit"}
              </h2>
              <p className="text-white/70 text-sm mt-2">
                You voted for Fit {selectedSide}
              </p>
            </div>
          </div>
          
          <div className="mt-2" ref={expandedRef}>
            <BattleCard
              side={selectedSide!}
              fit={
                selectedSide === "A"
                  ? resultPoll!.fitA
                  : resultPoll!.fitB
              }
              pollId={resultPoll!.id}
              mediaAlignment={selectedSide === "A" ? "left" : "right"}
              isSelected={true}
              isExpanded={false}
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