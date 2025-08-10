import { useMemo, useState } from "react";
import ItemPickerModal from "../create/ItemPickerModal";
import { Fit, Item } from "../../types";
import { usePolls } from "../../contexts/PollsContext";
import { useUser } from "../../contexts/UserContext";
import { Button, useProductSearch, usePopularProducts } from "@shopify/shop-minis-react";

export default function Create({ navigate }: { navigate: (path: string) => void }) {
  const { createPoll } = usePolls();
  const user = useUser();

  // Search for products by category keywords
  const {
    products: outerAndShirts,
    loading: loadingOuter,
    error: errorOuter,
  } = useProductSearch({
    query: 'overcoat shirt jacket coat',
    first: 5,
  });

  const {
    products: teesAndInners,
    loading: loadingTop,
    error: errorTop,
  } = useProductSearch({
    query: 'tshirt t-shirt inner undershirt',
    first: 5,
  });

  const {
    products: trousers,
    loading: loadingBottom,
    error: errorBottom,
  } = useProductSearch({
    query: 'trouser pants jeans',
    first: 5,
  });

  // Fallback to popular products if search fails
  const { products: popularProducts, loading: loadingPopular } = usePopularProducts();

  // Debug logging
  console.log('Product search debug:', {
    outerAndShirts: outerAndShirts?.length || 0,
    teesAndInners: teesAndInners?.length || 0,
    trousers: trousers?.length || 0,
    popularProducts: popularProducts?.length || 0,
    errors: { errorOuter, errorTop, errorBottom }
  });

  const productToItem = (p: any): Item => {
    const imageUrl =
      p?.image?.url ??
      p?.featuredImage?.url ??
      p?.images?.[0]?.url ??
      p?.images?.[0]?.src ??
      "";

    const rawPrice =
      p?.price?.amount ??
      p?.minPrice?.amount ??
      p?.priceRange?.minVariantPrice?.amount ??
      p?.variants?.[0]?.price?.amount ??
      0;

    const price = typeof rawPrice === "number" ? rawPrice : parseFloat(rawPrice) || 0;

    return {
      id: String(p?.id ?? ""),
      title: String(p?.title ?? "Untitled"),
      imageUrl,
      price,
      merchant: String(p?.vendor ?? p?.merchant ?? "Unknown"),
      category: (Array.isArray(p?.tags) && p.tags[0]) || p?.productType || p?.category || "",
    };
  };

  // Combine all searched products into one list, fallback to popular products
  const allProducts: any[] = useMemo(() => {
    const outerList = Array.isArray(outerAndShirts) ? outerAndShirts : (outerAndShirts as any)?.nodes ?? [];
    const topList = Array.isArray(teesAndInners) ? teesAndInners : (teesAndInners as any)?.nodes ?? [];
    const bottomList = Array.isArray(trousers) ? trousers : (trousers as any)?.nodes ?? [];
    
    console.log('Product lists:', { outerList, topList, bottomList });
    
    // If no searched products found, use popular products as fallback
    if (outerList.length === 0 && topList.length === 0 && bottomList.length === 0) {
      console.log('No searched products found, using popular products fallback');
      const popularList = Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? [];
      return popularList;
    }
    
    // Combine all searched products
    const combined = [
      ...outerList,
      ...topList,
      ...bottomList
    ];
    
    console.log('Combined searched products:', combined.length);
    return combined;
  }, [outerAndShirts, teesAndInners, trousers, popularProducts]);

  // Convert to Item format for the existing system
  const curatedItems: Item[] = useMemo(() => {
    return allProducts.map(productToItem);
  }, [allProducts]);

  const itemById = useMemo(
    () => new Map(curatedItems.map((i) => [i.id, i] as const)),
    [curatedItems]
  );

  const [nameA, setNameA] = useState("A");
  const [nameB, setNameB] = useState("B");
  const [desc, setDesc] = useState("");
  const [fitAIds, setFitAIds] = useState<string[]>(["", "", ""]);
  const [fitBIds, setFitBIds] = useState<string[]>(["", "", ""]);

  const [picker, setPicker] = useState<{ open: boolean; col: "A" | "B"; idx: number }>({
    open: false,
    col: "A",
    idx: 0,
  });

  const loadingAny = loadingOuter || loadingTop || loadingBottom || loadingPopular;
  const errorAny = errorOuter || errorTop || errorBottom;

  const canPublish = useMemo(
    () => desc.trim().length > 0 && fitAIds.every(Boolean) && fitBIds.every(Boolean),
    [desc, fitAIds, fitBIds]
  );

  function select(col: "A" | "B", idx: number) {
    setPicker({ open: true, col, idx });
  }

  function placeItem(id: string) {
    if (picker.col === "A") {
      const next = [...fitAIds];
      next[picker.idx] = id;
      setFitAIds(next);
    } else {
      const next = [...fitBIds];
      next[picker.idx] = id;
      setFitBIds(next);
    }
    setPicker((prev) => ({ ...prev, open: false }));
  }

  function publish() {
    if (!canPublish) return;
    const fitA: Fit = { id: `fit_${Date.now()}_A`, name: nameA || "A", itemIds: fitAIds };
    const fitB: Fit = { id: `fit_${Date.now()}_B`, name: nameB || "B", itemIds: fitBIds };
    createPoll({ description: desc, fitA, fitB }, user.id);
    alert("Published!");
    navigate("/vote");
  }

  const Slot = ({ id, onClick }: { id?: string; onClick: () => void }) => {
    const item = id ? itemById.get(id) : undefined;
    return (
      <button
        onClick={onClick}
        className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center overflow-hidden"
        title={loadingAny ? "Loading products..." : undefined}
      >
        {item ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{loadingAny ? "…" : "+"}</span>
        )}
      </button>
    );
  };

  return (
    <div className="pt-4 pb-28 px-5">
      <div className="mb-3 flex flex-col items-center">
        <Button onClick={() => navigate("/")} className="text-black text-2xl">
          ←
        </Button>
        <div className="w-full mb-4">
          <h2 className="text-2xl font-bold text-center">Create your poll</h2>
        </div>
      </div>

      {loadingAny && (
        <div className="mb-3 text-center text-sm text-gray-600">Searching for products…</div>
      )}
      {errorAny && (
        <div className="mb-3 text-center text-sm text-red-600">
          Couldn't search for products. Using popular products instead.
        </div>
      )}
      {curatedItems.length === 0 && !loadingAny && (
        <div className="mb-3 text-center text-sm text-yellow-600">
          No products found. Check your search queries.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          value={nameA}
          onChange={(e) => setNameA(e.target.value)}
          className="bg-gray-200 rounded px-3 py-2"
          placeholder="name of fit"
        />
        <input
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
          className="bg-gray-200 rounded px-3 py-2"
          placeholder="name of fit"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 items-start mb-6">
        <div className="flex flex-col items-center gap-6">
          {fitAIds.map((id, idx) => (
            <Slot key={idx} id={id} onClick={() => select("A", idx)} />
          ))}
        </div>
        <div className="flex flex-col items-center gap-6">
          {fitBIds.map((id, idx) => (
            <Slot key={idx} id={id} onClick={() => select("B", idx)} />
          ))}
        </div>
      </div>

      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full rounded-xl bg-gray-200 p-4 max-h-12 mb-4"
        placeholder="Description"
      />

      <Button onClick={publish} disabled={!canPublish || loadingAny}>
        Publish
      </Button>

      <ItemPickerModal
        open={picker.open}
        onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
        items={curatedItems}
        onSelect={(item) => placeItem(item.id)}
        products={allProducts}
      />
    </div>
  );
}

