import { useMemo } from "react";
import { usePolls } from "../contexts/PollsContext";
import { useCatalog } from "../contexts/CatalogContext";
import { Item } from "../types";
import { ArrowLeft } from "lucide-react";
export default function PollResults({
  pollId,
  navigate,
}: {
  pollId: string;
  navigate?: (path: string) => void;
}) {
  const { polls } = usePolls();
  const { items } = useCatalog();
  
  const poll = useMemo(() => polls.find(p => p.id === pollId), [polls, pollId]);
  
  const getItemsByIds = (itemIds: string[]): Item[] => {
    return itemIds.map(id => items.find(item => item.id === id)).filter(Boolean) as Item[];
  };

  if (!poll) {
    return (
      <div className="pt-6 pb-28 px-4">
        <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate?.("/")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold flex-1 text-center">Poll not found.</h2>
        <div className="w-12" />
      </div>
      </div>
    );
  }

  const total = poll.votes.A + poll.votes.B || 1;
  const aPct = Math.round((poll.votes.A / total) * 100);
  const bPct = 100 - aPct;
  const itemsA = getItemsByIds(poll.fitA.itemIds);
  const itemsB = getItemsByIds(poll.fitB.itemIds);

  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate?.("/")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold flex-1 text-center">{poll.description}</h2>
        <div className="w-12" />
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600 flex justify-between">
          <span>Total votes: {total}</span>
          <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Single percentage bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">{poll.fitA.name}: {aPct}%</span>
          <span className="text-sm font-medium">{poll.fitB.name}: {bPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${aPct}%` }}
            />
            <div 
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${bPct}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{poll.votes.A} votes</span>
          <span>{poll.votes.B} votes</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Option A */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <h4 className="font-medium mb-4">{poll.fitA.name}</h4>
            <div className="grid grid-cols-2 gap-2">
              {itemsA.map((item) => (
                <div key={item.id} className="text-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full aspect-square object-cover rounded-lg mb-1"
                  />
                  <div className="text-xs text-gray-700 line-clamp-2">{item.title}</div>
                  <div className="text-xs text-gray-500">${item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Option B */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <h4 className="font-medium mb-4">{poll.fitB.name}</h4>
            <div className="grid grid-cols-2 gap-2">
              {itemsB.map((item) => (
                <div key={item.id} className="text-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full aspect-square object-cover rounded-lg mb-1"
                  />
                  <div className="text-xs text-gray-700 line-clamp-2">{item.title}</div>
                  <div className="text-xs text-gray-500">${item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}