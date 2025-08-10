import { useMemo, useState } from "react";
import ItemPickerModal from "../create/ItemPickerModal";
import { Fit, Item } from "../../types";
import { usePolls } from "../../contexts/PollsContext";
import { useUser } from "../../contexts/UserContext";
import {
  Button,
  useProductSearch,
  usePopularProducts,
  useBuyerAttributes,
} from "@shopify/shop-minis-react";

export default function Create({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const { createPoll } = usePolls();
  const user = useUser();

  // Get buyer attributes for gender-based personalization
  const { buyerAttributes, loading: loadingAttributes } = useBuyerAttributes();

  // Manual gender selection state
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [showGenderPrompt, setShowGenderPrompt] = useState(false);

  // Determine the effective gender (from attributes or manual selection)
  const effectiveGender = buyerAttributes?.genderAffinity || selectedGender;

  // Show gender prompt if no attributes and no manual selection
  useMemo(() => {
    if (
      !loadingAttributes &&
      !buyerAttributes?.genderAffinity &&
      !selectedGender
    ) {
      setShowGenderPrompt(true);
    }
  }, [loadingAttributes, buyerAttributes?.genderAffinity, selectedGender]);

  // Determine gender-specific search terms
  const getGenderSpecificQuery = (baseQuery: string) => {
    if (!effectiveGender) return baseQuery;

    const gender = effectiveGender.toLowerCase();

    switch (gender) {
      case "male":
      case "men":
        return `${baseQuery} men male`;
      case "female":
      case "women":
        return `${baseQuery} women female`;
      default:
        return baseQuery;
    }
  };

  // Search for products by slot type with gender personalization
  const {
    products: outerwearProducts,
    loading: loadingOuterwear,
    error: errorOuterwear,
  } = useProductSearch({
    query: getGenderSpecificQuery("coat jacket overcoat blazer"),
    first: 8,
  });

  const {
    products: topProducts,
    loading: loadingTop,
    error: errorTop,
  } = useProductSearch({
    query: getGenderSpecificQuery("tshirt t-shirt inner undershirt shirt"),
    first: 8,
  });

  const {
    products: bottomProducts,
    loading: loadingBottom,
    error: errorBottom,
  } = useProductSearch({
    query: getGenderSpecificQuery("pants trousers jeans leggings"),
    first: 8,
  });

  // Fallback to popular products if search fails
  const { products: popularProducts, loading: loadingPopular } =
    usePopularProducts();

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

    const price =
      typeof rawPrice === "number" ? rawPrice : parseFloat(rawPrice) || 0;

    return {
      id: String(p?.id ?? ""),
      title: String(p?.title ?? "Untitled"),
      imageUrl,
      price,
      merchant: String(p?.vendor ?? p?.merchant ?? "Unknown"),
      category:
        (Array.isArray(p?.tags) && p.tags[0]) ||
        p?.productType ||
        p?.category ||
        "",
    };
  };

  // Get products for specific slot type
  const getProductsForSlot = (slotIndex: number) => {
    const outerwearList = Array.isArray(outerwearProducts)
      ? outerwearProducts
      : ((outerwearProducts as any)?.nodes ?? []);
    const topList = Array.isArray(topProducts)
      ? topProducts
      : ((topProducts as any)?.nodes ?? []);
    const bottomList = Array.isArray(bottomProducts)
      ? bottomProducts
      : ((bottomProducts as any)?.nodes ?? []);

    // If no products found, use popular products as fallback
    if (
      outerwearList.length === 0 &&
      topList.length === 0 &&
      bottomList.length === 0
    ) {
      const popularList = Array.isArray(popularProducts)
        ? popularProducts
        : ((popularProducts as any)?.nodes ?? []);
      return popularList;
    }

    switch (slotIndex) {
      case 0:
        return outerwearList.length > 0
          ? outerwearList
          : Array.isArray(popularProducts)
            ? popularProducts
            : ((popularProducts as any)?.nodes ?? []);
      case 1:
        return topList.length > 0
          ? topList
          : Array.isArray(popularProducts)
            ? popularProducts
            : ((popularProducts as any)?.nodes ?? []);
      case 2:
        return bottomList.length > 0
          ? bottomList
          : Array.isArray(popularProducts)
            ? popularProducts
            : ((popularProducts as any)?.nodes ?? []);
      default:
        return Array.isArray(popularProducts)
          ? popularProducts
          : ((popularProducts as any)?.nodes ?? []);
    }
  };

  const itemById = useMemo(() => {
    const allItems = [
      ...getProductsForSlot(0).map(productToItem),
      ...getProductsForSlot(1).map(productToItem),
      ...getProductsForSlot(2).map(productToItem),
    ];
    return new Map(allItems.map((i) => [i.id, i] as const));
  }, [outerwearProducts, topProducts, bottomProducts, popularProducts]);

  const [nameA, setNameA] = useState("A");
  const [nameB, setNameB] = useState("B");
  const [desc, setDesc] = useState("");
  const [fitAIds, setFitAIds] = useState<string[]>(["", "", ""]);
  const [fitBIds, setFitBIds] = useState<string[]>(["", "", ""]);

  const [picker, setPicker] = useState<{
    open: boolean;
    col: "A" | "B";
    idx: number;
  }>({
    open: false,
    col: "A",
    idx: 0,
  });

  const loadingAny =
    loadingOuterwear ||
    loadingTop ||
    loadingBottom ||
    loadingPopular ||
    loadingAttributes;
  const errorAny = errorOuterwear || errorTop || errorBottom;

  // Calculate how many slots to show for each option - more restrictive
  const getVisibleSlots = (ids: string[], isOptionA: boolean) => {
    const filledCount = ids.filter((id) => id !== "").length;

    if (filledCount === 0) return 1;

    const otherOptionIds = isOptionA ? fitBIds : fitAIds;
    const otherOptionFilledCount = otherOptionIds.filter(
      (id) => id !== ""
    ).length;

    if (filledCount <= otherOptionFilledCount) {
      return Math.min(filledCount + 1, 3);
    }

    return filledCount;
  };

  const visibleSlotsA = getVisibleSlots(fitAIds, true);
  const visibleSlotsB = getVisibleSlots(fitBIds, false);

  const canPublish = useMemo(
    () =>
      desc.trim().length > 0 &&
      fitAIds.every(Boolean) &&
      fitBIds.every(Boolean),
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
      // console.log('Selected for Option A:', { slot: picker.idx, productId: id, allAIds: next });
    } else {
      const next = [...fitBIds];
      next[picker.idx] = id;
      setFitBIds(next);
      // console.log('Selected for Option B:', { slot: picker.idx, productId: id, allBIds: next });
    }
    setPicker((prev) => ({ ...prev, open: false }));
  }

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setShowGenderPrompt(false);
  };

  async function publish() {
    if (!canPublish) return;
    const fitA: Fit = {
      id: `fit_${Date.now()}_A`,
      name: nameA || "A",
      itemIds: fitAIds,
    };
    const fitB: Fit = {
      id: `fit_${Date.now()}_B`,
      name: nameB || "B",
      itemIds: fitBIds,
    };
    await createPoll({ description: desc, fitA, fitB }, user.id);
    alert("Published!");
    navigate("/vote");
  }

  const Slot = ({
    id,
    onClick,
    isVisible,
  }: {
    id?: string;
    onClick: () => void;
    isVisible: boolean;
  }) => {
    if (!isVisible) return null;

    const item = id ? itemById.get(id) : undefined;
    return (
      <button
        onClick={onClick}
        className="w-20 h-20 rounded-xl border-2 border-white hover:border-blue-400 flex items-center justify-center overflow-hidden transition-colors duration-200"
        title={loadingAny ? "Loading products..." : undefined}
      >
        {item ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl text-white">{loadingAny ? "…" : "+"}</span>
        )}
      </button>
    );
  };

  // Current slot products for the modal
  const getCurrentSlotProducts = () => {
    if (!picker.open) return [];
    return getProductsForSlot(picker.idx);
  };

  const getCurrentSlotItems = () => {
    return getCurrentSlotProducts().map(productToItem);
  };

  // Gender selection prompt
  if (showGenderPrompt) {
    return (
      <div className="min-h-screen bg-black text-white pt-4 pb-28 px-5">
        <div className="mb-6 flex flex-col items-center">
          <Button
            onClick={() => navigate("/")}
            className="text-white text-2xl mb-4"
          >
            ←
          </Button>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            Select your preference
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto">
            Help us show you the most relevant products for your style
          </p>
        </div>
        <div className="space-y-4 max-w-sm mx-auto">
          <button
            onClick={() => handleGenderSelect("male")}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-lg">Men's Products</span>
          </button>
          <button
            onClick={() => handleGenderSelect("female")}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-lg">Women's Products</span>
          </button>
          <button
            onClick={() => handleGenderSelect("unisex")}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="text-lg">Show All Products</span>
          </button>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            You can change this preference later in settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white pt-4 pb-28 px-5 overflow-y-auto">
      <div className="mb-3 flex flex-col items-center">
        <Button onClick={() => navigate("/")} className="text-white text-2xl">
          ←
        </Button>
      </div>
      <div className="w-full mb-1">
        <h2 className="text-2xl font-bold text-center text-white">
          Create your poll
        </h2>
      </div>

      {loadingAny && (
        <div className="mb-3 text-center text-sm text-gray-300">
          {loadingAttributes
            ? "Loading your preferences..."
            : "Searching for products…"}
        </div>
      )}
      {errorAny && (
        <div className="mb-3 text-center text-sm text-red-400">
          Couldn't search for products. Using popular products instead.
        </div>
      )}

      {effectiveGender && (
        <div className="mb-3 text-center text-sm text-blue-400">
          Showing{" "}
          {effectiveGender === "male"
            ? "men"
            : effectiveGender === "female"
              ? "women"
              : "all"}{" "}
          products for you
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          value={nameA}
          onChange={(e) => setNameA(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          placeholder="name of fit"
        />
        <input
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          placeholder="name of fit"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 items-start mb-6">
        <div className="flex flex-col items-center gap-6">
          {fitAIds.map((id, idx) => (
            <Slot
              key={idx}
              id={id}
              onClick={() => select("A", idx)}
              isVisible={idx < visibleSlotsA}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-6">
          {fitBIds.map((id, idx) => (
            <Slot
              key={idx}
              id={id}
              onClick={() => select("B", idx)}
              isVisible={idx < visibleSlotsB}
            />
          ))}
        </div>
      </div>

      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full rounded-xl bg-gray-800 text-white border border-gray-600 p-4 max-h-12 mb-4 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        placeholder="Description"
      />

      <Button
        onClick={publish}
        disabled={!canPublish || loadingAny}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Publish
      </Button>

      <ItemPickerModal
        open={picker.open}
        onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
        items={getCurrentSlotItems()}
        onSelect={(item) => placeItem(item.id)}
        products={getCurrentSlotProducts()}
      />
    </div>
  );
}
