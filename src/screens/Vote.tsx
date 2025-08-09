import { useMemo, useState, useEffect, useRef } from "react";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";
import { useCatalog } from "../contexts/CatalogContext";
import { useSaved } from "../contexts/SavedContext";
import { Fit, Item } from "../types";

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
  onBack: () => void;
  onSubmit: () => void;
  onNext: () => void;
}) {
  const isResults = phase === "results" || phase === "exiting";
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
          <div className="rounded-full bg-zinc-800 h-12 relative overflow-hidden animate-fade-in">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
              {percent}%
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
    <div className="flex items-center gap-3">
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

function FitMediaStack({
  fit,
  items,
  alignment,
  isExpanded,
}: {
  fit: Fit;
  items: Item[];
  alignment: "left" | "right";
  isExpanded?: boolean;
}) {
  if (isExpanded) {
    return (
      <div className="space-y-4">
        {/* Big white box - main fit view */}
        <div className="bg-white rounded-2xl aspect-square flex items-center justify-center">
          <div className="text-zinc-400 text-sm">Main Fit View</div>
        </div>
        {/* Horizontal carousel of item thumbnails */}
        <div className="flex gap-2 overflow-x-auto snap-x pb-2">
          {fit.itemIds.map((itemId) => {
            const item = items.find((i) => i.id === itemId);
            return (
              <div
                key={itemId}
                className="flex-none w-16 h-16 bg-white rounded-lg snap-center overflow-hidden"
              >
                {item && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2x2 grid layout for normal view with fit name pinned top-left
  return (
    <div className="relative">
      {/* Title pinned */}
      <div className="absolute top-2 left-3 z-[5] text-white text-base font-semibold">{`Fit ${fit.name}`}</div>
      <div className="grid grid-cols-2 gap-2 pt-8">
        {fit.itemIds.slice(0, 4).map((itemId) => {
          const item = items.find((i) => i.id === itemId);
          return (
            <div
              key={itemId}
              className="aspect-[3/4] bg-white rounded-lg overflow-hidden relative"
            >
              {item && (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Item name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded-b-lg">
                    <div className="truncate">{item.title}</div>
                  </div>
                </>
              )}
            </div>
          );
        })}
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
        className={`flex-1 h-10 rounded-full text-sm font-medium transition-colors ${
          isActive ? "bg-zinc-800 text-white" : "bg-zinc-800/60 text-zinc-300"
        } ${isChosen ? "ring-2 ring-emerald-500" : ""}`}
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
  items,
  pollId,
  mediaAlignment,
  isSelected,
  isExpanded,
  tall,
  onSelect,
}: {
  side: "A" | "B";
  fit: Fit;
  items: Item[];
  pollId: string;
  mediaAlignment: "left" | "right";
  isSelected: boolean;
  isExpanded?: boolean;
  tall?: boolean;
  onSelect: () => void;
}) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(pollId, fit.id);

  // Determine button position based on side
  const actionRowPosition = "top-2 right-2";

  return (
    <div
      className={`
        rounded-xl bg-zinc-800 p-3 relative transition-all duration-300 h-[75dvh]
        ${isSelected ? "ring-3 ring-emerald-500" : ""}
        ${isExpanded ? "animate-expand-to-full min-h-[68dvh]" : ""}
        ${!isSelected && !isExpanded ? "scale-95" : ""}
      `}
    >
      <div className="animate-fade-in pointer-events-none">
        <FitMediaStack
          fit={fit}
          items={items}
          alignment={mediaAlignment}
          isExpanded={isExpanded}
        />
      </div>

      {/* Action buttons top-right (horizontal) */}
      <div
        className={`absolute ${actionRowPosition} z-20 flex items-center gap-2`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(pollId, fit.id, side);
          }}
          className="h-9 w-9 rounded-full bg-white/90 text-zinc-900 shadow grid place-items-center"
          aria-label="Save fit"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 5v8l5-3 5 3V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
          </svg>
        </button>
        <button
          className="h-9 w-9 rounded-md bg-zinc-900/70 text-zinc-100 grid place-items-center"
          aria-label="Expand fit"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M8 3v10M3 8h10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Full-card tap target above content but below action buttons */}
      <button
        onClick={onSelect}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`Select fit ${side}`}
      />
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
  const { items } = useCatalog();

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
  const [currentPoll, setCurrentPoll] = useState(() =>
    getNextOpenPollForUser(user.id)
  );
  const [nextPoll, setNextPoll] = useState(() =>
    getNextOpenPollForUser(user.id)
  );
  const expandedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!nextPoll) setNextPoll(getNextOpenPollForUser(user.id));
  }, [nextPoll, user.id, getNextOpenPollForUser]);

  // When switching tabs, auto-select that side and mark phase selected
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  useEffect(() => {
    setSelectedSide(activeTab);
    setPhase("selected");
  }, [activeTab]);

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

  function handleSubmit() {
    if (!selectedSide || !currentPoll) return;

    setPhase("submitting");

    const updated = voteOnPoll(currentPoll.id, selectedSide, user.id);
    if (updated) {
      const newTotal = updated.votes.A + updated.votes.B || 1;
      const percent = Math.round(
        (updated.votes[selectedSide] / newTotal) * 100
      );
      setPercentForSelected(percent);
      // Trigger expand once vote is saved
      requestAnimationFrame(() => setPhase("expanding"));
    }
  }

  function handleNext() {
    // Start exit animation on expanded card
    setPhase("exiting");
  }

  if (!currentPoll) {
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

  const isResultsPhase = phase === "results" || phase === "exiting";
  const expandedSide =
    isResultsPhase || phase === "expanding" ? selectedSide : null;

  return (
    <div className="min-h-[100dvh] bg-zinc-950 px-4 pt-1 pb-20">
      {!isResultsPhase && phase !== "expanding" ? (
        <>
          <div className="mt-2">
            <BattleCard
              side={activeTab}
              fit={activeTab === "A" ? currentPoll.fitA : currentPoll.fitB}
              items={items}
              pollId={currentPoll.id}
              mediaAlignment={activeTab === "A" ? "left" : "right"}
              isSelected={selectedSide === activeTab}
              tall
              onSelect={() => handleSelect(activeTab)}
            />
          </div>
        </>
      ) : (
        <div
          className={`mt-2 ${phase === "exiting" ? (selectedSide === "A" ? "animate-slide-out-up" : "animate-slide-out-down") : ""}`}
          ref={expandedRef}
          onAnimationEnd={(e) => {
            if (phase === "expanding") {
              setPhase("results");
            } else if (phase === "exiting") {
              // Swap to next poll and slide in
              setCurrentPoll(nextPoll);
              setNextPoll(getNextOpenPollForUser(user.id));
              setSelectedSide(null);
              setPercentForSelected(0);
              setActiveTab("A");
              setPhase("entering");
            }
          }}
        >
          <BattleCard
            side={selectedSide!}
            fit={selectedSide === "A" ? currentPoll.fitA : currentPoll.fitB}
            items={items}
            pollId={currentPoll.id}
            mediaAlignment={selectedSide === "A" ? "left" : "right"}
            isSelected={true}
            isExpanded={true}
            onSelect={() => {}}
          />
        </div>
      )}

      {phase === "entering" && (
        <div
          className={`mt-2 animate-slide-in-up`}
          onAnimationEnd={() => setPhase("idle")}
        >
          <BattleCard
            side={activeTab}
            fit={currentPoll!.fitA}
            items={items}
            pollId={currentPoll!.id}
            mediaAlignment="left"
            isSelected={false}
            tall
            onSelect={() => {}}
          />
        </div>
      )}

      <FitSelectors
        active={activeTab}
        selected={selectedSide}
        onChange={(s) => setActiveTab(s)}
      />
      <BottomActionBar
        phase={phase}
        canSubmit={!!selectedSide}
        percent={percentForSelected}
        onBack={() => navigate?.("/")}
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    </div>
  );
}
