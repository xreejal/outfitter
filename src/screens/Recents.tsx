import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
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
    () => polls
      .filter((p) => p.authorId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt),
    [polls, user.id]
  );

  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center mb-3">
        <button
          onClick={() => navigate?.("/")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors absolute left-4 z-10"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold w-full text-center">Recent Polls</h2>
      </div>
      <div className="flex flex-col gap-3">
        {mine.map((p) => {
          return (
            <button
              key={p.id}
              onClick={() => navigate?.(`/poll-results/${p.id}`)}
              className="bg-gray-100 rounded-xl p-3 text-left hover:bg-gray-200 transition-colors"
            >
              <div className="flex justify-between text-xs text-gray-600">
                <span className="font-semibold text-xl">{p.description}</span>
                <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{p.fitA.name} vs {p.fitB.name}</span>
              </div>
            </button>
          );
        })}
        {mine.length === 0 && (
          <div className="text-gray-600 text-sm">No recents yet.</div>
        )}
      </div>
    </div>
  );
}
