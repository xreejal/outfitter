import { useMemo } from "react";
import { useSaved } from "../contexts/SavedContext";
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen px-4 pt-6 pb-28">
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <button
            onClick={() => navigate?.("/")}
            className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>
        <h2 className="font-semibold text-xl text-center">Saved Fits</h2>
      </div>
      <div className="flex flex-col gap-3">
        {savedEntries.map((entry) => (
          <SavedFit key={`${entry.id}-${entry.fit.id}`} entry={entry} />
        ))}
        {savedEntries.length === 0 && (
          <div className="text-white/70 text-sm">No saved fits yet.</div>
        )}
      </div>
    </div>
  );
}

function buildProductGid(id: string): string {
  return id.startsWith("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`;
}

function SavedFit({ entry }: { entry: SavedEntry }) {
  const { toggleSave } = useSaved();
  const productIds = useMemo(
    () => entry.fit.itemIds.map((id) => buildProductGid(id)),
    [entry.fit.itemIds]
  );

  const { products, loading } = useProducts({ ids: productIds });

  return (
    <div className="glass-card border border-white/20 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-sm text-white">{entry.fit.name}</div>
          <div className="flex items-center gap-2">
            <div className="text-white/60 text-xs">Saved: {new Date(entry.savedAt).toLocaleDateString()}</div>
            <button
              onClick={async () => {
                await toggleSave(entry.id, entry.fit.id, "A"); // "A" is just a placeholder since choice isn't used in unsave
              }}
              className="h-8 w-8 grid place-items-center text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200"
              aria-label="Remove from saved"
              title="Remove from saved"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="transition-all duration-200"
              >
                <path d="M3 5v8l5-3 5 3V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mb-3 text-white/50 text-xs">by {entry.authorId}</div>

        <div className="gap-2 grid grid-cols-2 [&_*]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_span]:!text-white">
          {loading && productIds.map((id) => <ProductCardSkeleton key={`sk-${id}`} />)}
          {!loading && (products ?? []).map((product: any) => (
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
