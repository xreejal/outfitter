import React, { useMemo, useState } from "react";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";
import { useCatalog } from "../contexts/CatalogContext";
import FitCard from "../components/FitCard";

export default function Vote({
  navigate,
}: {
  navigate?: (path: string) => void;
}) {
  const { getNextOpenPollForUser, voteOnPoll } = usePolls();
  const user = useUser();
  const { items } = useCatalog();

  const poll = getNextOpenPollForUser(user.id);
  const [choice, setChoice] = useState<"A" | "B" | null>(null);
  const [submittedPollId, setSubmittedPollId] = useState<string | null>(null);

  const totals = useMemo(() => {
    if (!poll) return { A: 0, B: 0 };
    const total = poll.votes.A + poll.votes.B || 1;
    return {
      A: Math.round((poll.votes.A / total) * 100),
      B: Math.round((poll.votes.B / total) * 100),
    };
  }, [poll]);

  if (!poll) {
    return (
      <div className="pt-8 pb-28 px-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate?.("/")}
            className="text-sm text-blue-600"
          >
            ← back
          </button>
          <h2 className="text-xl font-semibold flex-1 text-center">Vote</h2>
          <div className="w-12" />
        </div>
        <p className="text-gray-600">No open battles. Create one!</p>
      </div>
    );
  }

  function submit() {
    if (!choice) return;
    const updated = voteOnPoll(poll.id, choice, user.id);
    if (updated) setSubmittedPollId(updated.id);
  }

  const showResults = !!submittedPollId;

  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate?.("/")}
          className="text-sm text-blue-600"
        >
          ← back
        </button>
        <h2 className="text-xl font-semibold flex-1 text-center">Vote</h2>
        <div className="w-12" />
      </div>
      <div className="rounded-xl bg-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">{poll.authorId}</div>
          <div className="text-xs text-gray-500">
            {new Date(poll.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-sm mb-4">{poll.description}</div>
        <div className="grid grid-cols-1 gap-3">
          <div
            className={`${choice === "A" ? "ring-2 ring-blue-500" : ""} ${showResults && choice === "A" ? "animate-expand" : ""}`}
          >
            <FitCard
              pollId={poll.id}
              fit={poll.fitA}
              items={items}
              selected={choice === "A"}
              onSelect={() => setChoice("A")}
            />
          </div>
          <div
            className={`${choice === "B" ? "ring-2 ring-blue-500" : ""} ${showResults && choice === "B" ? "animate-expand" : ""}`}
          >
            <FitCard
              pollId={poll.id}
              fit={poll.fitB}
              items={items}
              selected={choice === "B"}
              onSelect={() => setChoice("B")}
            />
          </div>
        </div>
        {!showResults ? (
          <button
            disabled={!choice}
            onClick={submit}
            className={`mt-4 w-full py-3 rounded-xl ${choice ? "bg-black text-white" : "bg-gray-300 text-gray-500"}`}
          >
            submit
          </button>
        ) : (
          <div className="mt-4">
            <div className="text-center text-sm mb-3">Results</div>
            <div className="flex gap-2 text-sm">
              <div className="flex-1 bg-white rounded p-2">A: {totals.A}%</div>
              <div className="flex-1 bg-white rounded p-2">B: {totals.B}%</div>
            </div>
            <a href="#/vote" className="block mt-4 text-center text-blue-600">
              next fit battle
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
