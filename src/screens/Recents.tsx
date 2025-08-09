import React, { useMemo } from "react";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";

export default function Recents({
  navigate,
}: {
  navigate?: (path: string) => void;
}) {
  const { polls } = usePolls();
  const user = useUser();
  const mine = useMemo(
    () => polls.filter((p) => p.authorId === user.id),
    [polls, user.id]
  );

  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate?.("/")}
          className="text-sm text-blue-600"
        >
          ← back
        </button>
        <h2 className="text-xl font-semibold flex-1 text-center">Recents</h2>
        <div className="w-12" />
      </div>
      <div className="flex flex-col gap-3">
        {mine.map((p) => {
          const total = p.votes.A + p.votes.B || 1;
          const aPct = Math.round((p.votes.A / total) * 100);
          const bPct = 100 - aPct;
          return (
            <div key={p.id} className="bg-gray-100 rounded-xl p-3">
              <div className="text-sm mb-1 line-clamp-1">{p.description}</div>
              <div className="text-xs text-gray-600">
                A: {aPct}% · B: {bPct}%
              </div>
            </div>
          );
        })}
        {mine.length === 0 && (
          <div className="text-gray-600 text-sm">No recents yet.</div>
        )}
      </div>
    </div>
  );
}
