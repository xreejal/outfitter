import { useEffect, useMemo, useRef, useState } from "react";
import { useSaved } from "../contexts/SavedContext";
import { ArrowLeft } from "lucide-react";
import { ProductCard, ProductCardSkeleton, useProducts } from "@shopify/shop-minis-react";
import type { SavedEntry } from "../types";

export default function Saved({
  navigate,
}: {
  navigate?: (path: string) => void;
}) {
  const { saved } = useSaved();
  const savedEntries = useMemo(
    () => saved.sort((a, b) => b.savedAt - a.savedAt),
    [saved]
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
        <h2 className="text-xl font-semibold w-full text-center">Saved Fits</h2>
      </div>
      <div className="flex flex-col gap-3">
        {savedEntries.map((entry) => (
          <SavedFit key={`${entry.id}-${entry.fit.id}`} entry={entry} />
        ))}
        {savedEntries.length === 0 && (
          <div className="text-gray-600 text-sm">No saved fits yet.</div>
        )}
      </div>
    </div>
  );
}

function buildProductGid(id: string): string {
  return id.startsWith("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`;
}

function SavedFit({ entry }: { entry: SavedEntry }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const productIds = useMemo(
    () => entry.fit.itemIds.map((id) => buildProductGid(id)),
    [entry.fit.itemIds]
  );

  const { products, loading } = useProducts({ ids: isVisible ? productIds : [] });

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">{entry.fit.name}</div>
          <div className="text-xs text-gray-500">Saved: {new Date(entry.savedAt).toLocaleDateString()}</div>
        </div>
        <div className="text-xs text-gray-500 mb-3">by {entry.authorId}</div>

        <div className="grid grid-cols-2 gap-2">
          {!isVisible && (
            <>
              <div className="col-span-2 text-xs text-gray-500">Scroll to load products…</div>
            </>
          )}
          {isVisible && loading && productIds.map((id) => <ProductCardSkeleton key={`sk-${id}`} />)}
          {isVisible && !loading && (products ?? []).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onFavoriteToggled={() => {
                // noop for now; future: integrate with minis favorites
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
