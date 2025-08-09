import React, { createContext, useContext, useEffect, useState } from "react";
import { Item } from "../types";
import {
  ensureSeedsLoaded,
  getLocal,
  setLocal,
  storageKeys,
} from "../data/seed-loader";

interface CatalogContextValue {
  items: Item[];
}

const CatalogContext = createContext<CatalogContextValue>({ items: [] });

export function useCatalog(): CatalogContextValue {
  return useContext(CatalogContext);
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    ensureSeedsLoaded().then(() => {
      const data = getLocal<Item[]>(storageKeys.CATALOG_KEY, []);
      setItems(data);
      // keep a mirror to ensure future reads get latest
      setLocal(storageKeys.CATALOG_KEY, data);
    });
  }, []);

  return (
    <CatalogContext.Provider value={{ items }}>
      {children}
    </CatalogContext.Provider>
  );
}
