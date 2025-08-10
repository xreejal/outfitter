import React, { createContext, useContext, useMemo } from "react";
import { supabase } from "../lib/supabase";

export type FitComment = {
  id: string;
  fit_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

interface CommentsContextValue {
  listComments: (fitId: string) => Promise<FitComment[]>;
  addComment: (
    fitId: string,
    authorId: string,
    body: string
  ) => Promise<FitComment>;
}

const CommentsContext = createContext<CommentsContextValue>({
  listComments: async () => [],
  addComment: async () => {
    throw new Error("not ready");
  },
});

export function useComments(): CommentsContextValue {
  return useContext(CommentsContext);
}

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo<CommentsContextValue>(
    () => ({
      listComments: async (fitId: string) => {
        const { data, error } = await supabase
          .from("fit_comments")
          .select("*")
          .eq("fit_id", fitId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return (data ?? []).map((d) => ({
          id: String(d.id),
          fit_id: String(d.fit_id),
          author_id: String(d.author_id),
          body: String(d.body),
          created_at: String(d.created_at),
        }));
      },
      addComment: async (fitId: string, authorId: string, body: string) => {
        const { data, error } = await supabase
          .from("fit_comments")
          .insert({ fit_id: fitId, author_id: authorId, body })
          .select("*")
          .single();
        if (error) throw error;
        return {
          id: String(data.id),
          fit_id: String(data.fit_id),
          author_id: String(data.author_id),
          body: String(data.body),
          created_at: String(data.created_at),
        };
      },
    }),
    []
  );

  return (
    <CommentsContext.Provider value={api}>{children}</CommentsContext.Provider>
  );
}
