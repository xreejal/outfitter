import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Clock, Eye, EyeOff, Sparkles } from "lucide-react";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";

export default function Recents({
  navigate,
}: {
  navigate?: (path: string) => void;
}) {
  const { polls } = usePolls();
  const user = useUser();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [unlockingPolls, setUnlockingPolls] = useState<Set<string>>(new Set());
  
  // Real-time countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Check if poll is within 30 minutes
  const isPollLocked = (createdAt: number) => {
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    return (currentTime - createdAt) < thirtyMinutes;
  };

  // Get time remaining until unlock
  const getTimeRemaining = (createdAt: number) => {
    const thirtyMinutes = 30 * 60 * 1000;
    const timeLeft = thirtyMinutes - (currentTime - createdAt);
    
    if (timeLeft <= 0) return null;
    
    const minutes = Math.floor(timeLeft / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle poll unlock animation
  const handlePollUnlock = (pollId: string) => {
    setUnlockingPolls(prev => new Set(prev).add(pollId));
    setTimeout(() => {
      setUnlockingPolls(prev => {
        const newSet = new Set(prev);
        newSet.delete(pollId);
        return newSet;
      });
    }, 2000);
  };

  const mine = useMemo(
    () => polls
      .filter((p) => p.authorId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt),
    [polls, user.id]
  );

  return (
    <div className="pt-6 pb-28 px-4 bg-black text-white min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate?.("/")}
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors absolute left-4 z-10"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold w-full text-center">Recent Polls</h2>
      </div>
      <div className="flex flex-col gap-4">
        {mine.map((p) => {
          const isLocked = isPollLocked(p.createdAt);
          const timeRemaining = getTimeRemaining(p.createdAt);
          const isUnlocking = unlockingPolls.has(p.id);
          
          // Check if poll just unlocked (only trigger once when it transitions from locked to unlocked)
          useEffect(() => {
            if (!isLocked && timeRemaining === null && !isUnlocking) {
              // Only trigger animation if this poll was previously locked
              const wasLocked = (currentTime - 1000) - p.createdAt < 30 * 60 * 1000;
              if (wasLocked) {
                handlePollUnlock(p.id);
              }
            }
          }, [isLocked, timeRemaining, p.id, isUnlocking, currentTime, p.createdAt]);
          
          return (
            <div
              key={p.id}
              className={`rounded-xl p-4 transition-all duration-500 ${
                isUnlocking 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-yellow-400 shadow-2xl scale-105' 
                  : isLocked 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750' 
                    : 'bg-gray-800 border border-blue-500 hover:bg-gray-750'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-lg text-white">{p.description}</span>
                <span className="text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {isLocked ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <EyeOff size={16} />
                    <span className="text-sm">Results hidden</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Clock size={16} className="animate-pulse" />
                    <span className="text-sm font-medium font-mono">
                      Unlocks in {timeRemaining}
                    </span>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">?</span>
                        </div>
                        <span className="text-gray-400">vs</span>
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">?</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Mystery results...
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    {isUnlocking ? (
                      <>
                        <Sparkles size={16} className="animate-spin text-yellow-400" />
                        <span className="text-sm font-bold animate-pulse">🎉 Just Unlocked!</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span className="text-sm">Results available</span>
                      </>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">
                      {p.fitA.name} vs {p.fitB.name}
                    </span>
                    <button
                      onClick={() => navigate?.(`/poll-results/${p.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {mine.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm">No polls created yet.</div>
            <div className="text-xs text-gray-500 mt-1">Create your first poll to see it here!</div>
          </div>
        )}
      </div>
    </div>
  );
}
