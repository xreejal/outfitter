import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Fit, Poll, Item } from "../types";
import {
  ensureSeedsLoaded,
  getLocal,
  setLocal,
  storageKeys,
} from "../data/seed-loader";

interface CreatePollInput {
  description: string;
  fitA: Fit;
  fitB: Fit;
}

interface PollsContextValue {
  polls: Poll[];
  createPoll: (input: CreatePollInput, authorId: string) => Poll;
  voteOnPoll: (
    pollId: string,
    choice: "A" | "B",
    userId: string
  ) => Poll | undefined;
  getNextOpenPollForUser: (userId: string) => Poll | undefined;
  closePoll: (pollId: string) => void;
  generateRandomBattle: () => Poll;
}

const PollsContext = createContext<PollsContextValue>({
  polls: [],
  createPoll: () => {
    throw new Error("not ready");
  },
  voteOnPoll: () => undefined,
  getNextOpenPollForUser: () => undefined,
  closePoll: () => {},
  generateRandomBattle: () => {
    throw new Error("not ready");
  },
});

export function usePolls(): PollsContextValue {
  return useContext(PollsContext);
}

function save(polls: Poll[]) {
  setLocal(storageKeys.POLLS_KEY, polls);
}

// Helper functions for generating random battles
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getRandomItems(items: Item[], count: number = 3): string[] {
  const shuffled = shuffleArray(items);
  return shuffled.slice(0, count).map(item => item.id);
}

const battleDescriptions = [
  "Street style showdown - which one wins?",
  "Casual Friday vibes - help me choose!",
  "Weekend outfit battle - your vote counts!",
  "Date night look - which is better?",
  "Work meeting style - professional or trendy?",
  "Coffee run outfit - comfort vs style?",
  "Night out ensemble - which one pops?",
  "Brunch date outfit - which catches your eye?",
  "Concert look - edgy vs classic?",
  "Shopping day style - practical or bold?",
  "Gym to street transition - which works?",
  "Vacation vibes - beachy or chic?",
  "First impression outfit - which one?",
  "Cozy autumn look - warm vs stylish?",
  "Spring fresh style - which is your pick?"
];

export function PollsProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    ensureSeedsLoaded().then(() => {
      setPolls(getLocal<Poll[]>(storageKeys.POLLS_KEY, []));
    });
  }, []);

  const api = useMemo<PollsContextValue>(
    () => ({
      polls,
      createPoll: (input: CreatePollInput, authorId: string) => {
        const id = `poll_${Date.now()}`;
        const poll: Poll = {
          id,
          authorId,
          description: input.description,
          fitA: input.fitA,
          fitB: input.fitB,
          createdAt: Date.now(),
          status: "open",
          votes: { A: 0, B: 0 },
          voters: {},
        };
        const updated = [poll, ...polls];
        setPolls(updated);
        save(updated);
        // index
        const index = getLocal<{ myPollIds: string[] }>(storageKeys.INDEX_KEY, {
          myPollIds: [],
        });
        index.myPollIds.unshift(id);
        setLocal(storageKeys.INDEX_KEY, index);
        return poll;
      },
      voteOnPoll: (pollId: string, choice: "A" | "B", userId: string) => {
        const idx = polls.findIndex((p) => p.id === pollId);
        if (idx === -1) return undefined;
        const poll = polls[idx];
        if (poll.voters[userId]) return poll;
        const updated: Poll = {
          ...poll,
          votes: { ...poll.votes, [choice]: poll.votes[choice] + 1 },
          voters: { ...poll.voters, [userId]: choice },
        };
        const next = [...polls];
        next[idx] = updated;
        setPolls(next);
        save(next);
        return updated;
      },
      getNextOpenPollForUser: (userId: string): Poll | undefined => {
        const availablePoll = polls.find((p) => p.status === "open" && !p.voters[userId]);
        
        // If no available polls, generate a new one automatically
        if (!availablePoll) {
          const items = getLocal<Item[]>(storageKeys.CATALOG_KEY, []);
          if (items.length >= 6) { // Need at least 6 items to create 2 fits
            return api.generateRandomBattle();
          }
        }
        
        return availablePoll;
      },
      closePoll: (pollId: string) => {
        const idx = polls.findIndex((p) => p.id === pollId);
        if (idx === -1) return;
        const updated = [...polls];
        updated[idx] = { ...updated[idx], status: "closed" };
        setPolls(updated);
        save(updated);
      },
      generateRandomBattle: () => {
        const items = getLocal<Item[]>(storageKeys.CATALOG_KEY, []);
        const description = battleDescriptions[Math.floor(Math.random() * battleDescriptions.length)];
        
        const fitA: Fit = {
          id: `fit_${Date.now()}_A`,
          name: "A",
          itemIds: getRandomItems(items, 4) // Get 4 items for 2x2 grid
        };
        
        const fitB: Fit = {
          id: `fit_${Date.now()}_B`,
          name: "B", 
          itemIds: getRandomItems(items, 4) // Get 4 items for 2x2 grid
        };
        
        const poll: Poll = {
          id: `poll_auto_${Date.now()}`,
          authorId: "system",
          description,
          fitA,
          fitB,
          createdAt: Date.now(),
          status: "open",
          votes: { A: 0, B: 0 },
          voters: {},
        };
        
        const updated = [poll, ...polls];
        setPolls(updated);
        save(updated);
        
        return poll;
      },
    }),
    [polls]
  );

  return <PollsContext.Provider value={api}>{children}</PollsContext.Provider>;
}
