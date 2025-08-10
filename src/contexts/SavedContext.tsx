import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { SavedEntry } from "../types";
import { supabase } from "../lib/supabase";

interface SavedContextValue {
  saved: SavedEntry[];
  isSaved: (pollId: string, fitId: string) => boolean;
  toggleSave: (pollId: string, fitId: string, choice: "A" | "B") => Promise<void>;
}

const SavedContext = createContext<SavedContextValue>({
  saved: [],
  isSaved: () => false,
  toggleSave: async () => {},
});

export function useSaved(): SavedContextValue {
  return useContext(SavedContext);
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedEntry[]>([]);

  const loadSavedFits = useCallback(async (userId: string) => {
    try {
      // Get saved fit records with fit info
      const { data: savedRecords, error } = await supabase
        .from("saved_fits")
        .select(`
          fit_id,
          created_at,
          fits (
            id,
            name,
            products
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      const entries: SavedEntry[] = [];
      
      // For each saved fit, find the published battle that contains it
      for (const record of savedRecords || []) {
        try {
          const { data: battles, error: battleError } = await supabase
            .from("published_battles")
            .select("id, author_id")
            .or(`fit_a_id.eq.${record.fit_id},fit_b_id.eq.${record.fit_id}`);
          
          if (battleError) throw battleError;
          
          // Use the first matching battle (there should typically be only one)
          const battle = battles?.[0];
          const fitData = (record as any).fits; // Type assertion to handle Supabase join result
          if (battle && fitData) {
            entries.push({
              id: battle.id,
              authorId: battle.author_id,
              fit: {
                id: fitData.id,
                name: fitData.name,
                itemIds: Array.isArray(fitData.products) 
                  ? fitData.products.map((p: any) => String(p.id))
                  : []
              },
              savedAt: new Date(record.created_at).getTime(),
            });
          }
        } catch (err) {
          console.error("Error processing saved fit record:", err);
        }
      }

      setSaved(entries);
    } catch (error) {
      console.error("Error loading saved fits:", error);
      setSaved([]);
    }
  }, []);

  useEffect(() => {
    // Load saved fits for the current user (using "user_local" for now)
    loadSavedFits("user_local");
  }, [loadSavedFits]);

  const api = useMemo<SavedContextValue>(
    () => ({
      saved,
      isSaved: (pollId: string, fitId: string) =>
        saved.some((s) => s.id === pollId && s.fit.id === fitId),
      toggleSave: async (pollId: string, fitId: string, _choice: "A" | "B") => {
        const userId = "user_local"; // Using hardcoded user ID for now
        const existing = saved.find((s) => s.id === pollId && s.fit.id === fitId);
        
        if (existing) {
          // Remove from saved
          try {
            const { error } = await supabase
              .from("saved_fits")
              .delete()
              .eq("user_id", userId)
              .eq("fit_id", fitId);
            
            if (error) throw error;
            
            setSaved(prev => prev.filter(s => !(s.id === pollId && s.fit.id === fitId)));
          } catch (error) {
            console.error("Error removing saved fit:", error);
          }
        } else {
          // Add to saved
          try {
            // First, get the fit info to create a proper SavedEntry
            const { data: fit, error: fitError } = await supabase
              .from("fits")
              .select("id, name, products")
              .eq("id", fitId)
              .single();
            
            if (fitError) throw fitError;

            // Get the published battle info  
            const { data: battle, error: battleError } = await supabase
              .from("published_battles")
              .select("id, author_id")
              .eq("id", pollId)
              .single();
            
            if (battleError) throw battleError;

            // Insert the saved fit record
            const { error: insertError } = await supabase
              .from("saved_fits")
              .insert({
                user_id: userId,
                fit_id: fitId
              });
            
            if (insertError) throw insertError;

            // Add to local state
            const entry: SavedEntry = {
              id: battle.id,
              authorId: battle.author_id,
              fit: {
                id: fit.id,
                name: fit.name,
                itemIds: Array.isArray(fit.products) 
                  ? fit.products.map((p: any) => String(p.id))
                  : []
              },
              savedAt: Date.now(),
            };
            
            setSaved(prev => [entry, ...prev]);
          } catch (error) {
            console.error("Error saving fit:", error);
          }
        }
      },
    }),
    [saved]
  );

  return <SavedContext.Provider value={api}>{children}</SavedContext.Provider>;
}
