import React from "react";
import { useSaved } from "../contexts/SavedContext";

export default function Saved({
  navigate,
}: {
  navigate?: (path: string) => void;
}) {
  const { saved } = useSaved();
  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate?.("/")}
          className="text-sm text-blue-600"
        >
          ← back
        </button>
        <h2 className="text-xl font-semibold flex-1 text-center">Saved</h2>
        <div className="w-12" />
      </div>
      <div className="flex flex-col gap-3">
        {saved.map((s) => (
          <a
            key={`${s.pollId}-${s.fitId}`}
            href={`#/vote`}
            className="bg-gray-100 rounded-xl p-3 text-sm"
          >
            Fit {s.choice} from {s.pollId}
          </a>
        ))}
        {saved.length === 0 && (
          <div className="text-gray-600 text-sm">No saved fits yet.</div>
        )}
      </div>
    </div>
  );
}
