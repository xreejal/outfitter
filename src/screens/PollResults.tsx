import { useMemo, useEffect, useState } from "react";
import { usePolls } from "../contexts/PollsContext";
import { ArrowLeft } from "lucide-react";
import {
  ProductCard,
  ProductCardSkeleton,
  useProducts,
} from "@shopify/shop-minis-react";
export default function PollResults({
  pollId,
  navigate,
}: {
  pollId: string;
  navigate?: (path: string) => void;
}) {
  const { polls } = usePolls();

  const poll = useMemo(
    () => polls.find((p) => p.id === pollId),
    [polls, pollId]
  );

  const buildProductGid = (id: string) =>
    id.startsWith("gid://shopify/Product/")
      ? id
      : `gid://shopify/Product/${id}`;

  if (!poll) {
    return (
      <div className="flex items-center mb-3">
        <button
          onClick={() => navigate?.("/recents")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors absolute left-4 z-10"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold w-full text-center">
          Poll Not Found.
        </h2>
      </div>
    );
  }

  const total = poll.votes.A + poll.votes.B || 1;
  const aPct = Math.round((poll.votes.A / total) * 100);
  const bPct = 100 - aPct;

  // Animation states for smooth percentage bar
  const [animatedAPct, setAnimatedAPct] = useState(0);
  const [animatedBPct, setAnimatedBPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAPct(aPct);
      setAnimatedBPct(bPct);
    }, 100);
    return () => clearTimeout(timer);
  }, [aPct, bPct]);

  // Build GIDs directly from poll item ids (aligns with Vote.tsx behavior)
  const productIdsA = poll.fitA.itemIds.map((id: string) =>
    buildProductGid(id)
  );
  const productIdsB = poll.fitB.itemIds.map((id: string) =>
    buildProductGid(id)
  );

  const { products: productsA, loading: loadingA } = useProducts({
    ids: productIdsA,
  });
  const { products: productsB, loading: loadingB } = useProducts({
    ids: productIdsB,
  });

  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center mb-3">
        <button
          onClick={() => navigate?.("/recents")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors absolute left-4 z-10"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold w-full text-center">
          {poll.description}
        </h2>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600 flex justify-between">
          <span>Total votes: {total}</span>
          <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Single percentage bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">
            {poll.fitA.name}: {aPct}%
          </span>
          <span className="text-sm font-medium">
            {poll.fitB.name}: {bPct}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
          <div className="h-full relative">
            {/* Left bar (blue) - grows from left */}
            <div
              className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{
                width: `${animatedAPct}%`,
                transformOrigin: "left",
              }}
            />
            {/* Right bar (red) - grows from right */}
            <div
              className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-1000 ease-out"
              style={{
                width: `${animatedBPct}%`,
                transformOrigin: "right",
              }}
            />
          </div>
          {/* Shimmer effect overlay */}
          <div
            className="absolute top-0 left-0 h-full w-full opacity-30 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 transition-transform duration-1000 ease-out"
            style={{
              transform: `translateX(${animatedAPct > 0 || animatedBPct > 0 ? "100%" : "-100%"}) skewX(-12deg)`,
              transitionDelay: "200ms",
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{poll.votes.A} votes</span>
          <span>{poll.votes.B} votes</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Option A */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <h4 className="font-medium mb-4">{poll.fitA.name}</h4>
            <div className="grid grid-cols-2 gap-2">
              {loadingA &&
                productIdsA.map((id) => (
                  <ProductCardSkeleton key={`sk-${id}`} />
                ))}
              {!loadingA &&
                (productsA ?? []).map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onFavoriteToggled={(isFavorited: boolean) => {
                      console.log("Favorite toggled:", product.id, isFavorited);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Option B */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <h4 className="font-medium mb-4">{poll.fitB.name}</h4>
            <div className="grid grid-cols-2 gap-2">
              {loadingB &&
                productIdsB.map((id) => (
                  <ProductCardSkeleton key={`sk-${id}`} />
                ))}
              {!loadingB &&
                (productsB ?? []).map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onFavoriteToggled={(isFavorited: boolean) => {
                      console.log("Favorite toggled:", product.id, isFavorited);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
