import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Poll, SavedEntry } from "../types";
import {
  ensureSeedsLoaded,
  getLocal,
  setLocal,
  storageKeys,
} from "../data/seed-loader";

interface SavedContextValue {
  saved: SavedEntry[];
  isSaved: (pollId: string, fitId: string) => boolean;
  toggleSave: (pollId: string, fitId: string, choice: "A" | "B") => void;
}

const SavedContext = createContext<SavedContextValue>({
  saved: [],
  isSaved: () => false,
  toggleSave: () => {},
});

export function useSaved(): SavedContextValue {
  return useContext(SavedContext);
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedEntry[]>([]);

  useEffect(() => {
    ensureSeedsLoaded().then(() => {
      const raw = getLocal<SavedEntry[]>(storageKeys.SAVED_KEY, []);
      setSaved(raw);
    });
  }, []);

  const api = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (pollId: string, fitId: string) =>
        saved.some((s) => s.id === pollId && s.fit.id === fitId),
      toggleSave: (pollId: string, fitId: string, _choice: "A" | "B") => {
        let next: SavedEntry[];
        const existing = saved.find((s) => s.id === pollId && s.fit.id === fitId);
        if (existing) {
          next = saved.filter((s) => !(s.id === pollId && s.fit.id === fitId));
        } else {
          const polls = getLocal<Poll[]>(storageKeys.POLLS_KEY, []);
          const poll = polls.find((p) => p.id === pollId);
          const fit = poll ? [poll.fitA, poll.fitB].find((f) => f.id === fitId) : undefined;
          if (!poll || !fit) {
            // If we can't resolve the poll/fit, keep state unchanged
            next = saved;
          } else {
            const entry: SavedEntry = {
              id: poll.id,
              authorId: poll.authorId,
              fit,
              savedAt: Date.now(),
            };
            next = [entry, ...saved];
          }
        }
        setSaved(next);
        setLocal(storageKeys.SAVED_KEY, next);
      },
    }),
    [saved]
  );

  return <SavedContext.Provider value={api}>{children}</SavedContext.Provider>;
}
