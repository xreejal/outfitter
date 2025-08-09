import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Fit, Poll } from "../types";
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
}

const PollsContext = createContext<PollsContextValue>({
  polls: [],
  createPoll: () => {
    throw new Error("not ready");
  },
  voteOnPoll: () => undefined,
  getNextOpenPollForUser: () => undefined,
  closePoll: () => {},
});

export function usePolls(): PollsContextValue {
  return useContext(PollsContext);
}

function save(polls: Poll[]) {
  setLocal(storageKeys.POLLS_KEY, polls);
}

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
      getNextOpenPollForUser: (userId: string) => {
        return polls.find((p) => p.status === "open" && !p.voters[userId]);
      },
      closePoll: (pollId: string) => {
        const idx = polls.findIndex((p) => p.id === pollId);
        if (idx === -1) return;
        const updated = [...polls];
        updated[idx] = { ...updated[idx], status: "closed" };
        setPolls(updated);
        save(updated);
      },
    }),
    [polls]
  );

  return <PollsContext.Provider value={api}>{children}</PollsContext.Provider>;
}
