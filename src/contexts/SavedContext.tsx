import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SavedEntry } from "../types";
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
      const raw = getLocal<{ savedFits: SavedEntry[] }>(storageKeys.SAVED_KEY, {
        savedFits: [],
      });
      setSaved(raw.savedFits);
    });
  }, []);

  const api = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (pollId: string, fitId: string) =>
        saved.some((s) => s.pollId === pollId && s.fitId === fitId),
      toggleSave: (pollId: string, fitId: string, choice: "A" | "B") => {
        let next: SavedEntry[];
        const existing = saved.find(
          (s) => s.pollId === pollId && s.fitId === fitId
        );
        if (existing) {
          next = saved.filter(
            (s) => !(s.pollId === pollId && s.fitId === fitId)
          );
        } else {
          next = [{ pollId, fitId, choice, savedAt: Date.now() }, ...saved];
        }
        setSaved(next);
        setLocal(storageKeys.SAVED_KEY, { savedFits: next });
      },
    }),
    [saved]
  );

  return <SavedContext.Provider value={api}>{children}</SavedContext.Provider>;
}
