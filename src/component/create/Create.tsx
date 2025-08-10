import { useMemo, useState } from "react";
import ItemPickerModal from "../create/ItemPickerModal";
import { Fit, Item } from "../../types";
import { usePolls } from "../../contexts/PollsContext";
import { useUser } from "../../contexts/UserContext";
import { Button, useProductSearch, usePopularProducts, useBuyerAttributes } from "@shopify/shop-minis-react";

export default function Create({ navigate }: { navigate: (path: string) => void }) {
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
    if (!loadingAttributes && !buyerAttributes?.genderAffinity && !selectedGender) {
      setShowGenderPrompt(true);
    }
  }, [loadingAttributes, buyerAttributes?.genderAffinity, selectedGender]);
  
  // Determine gender-specific search terms
  const getGenderSpecificQuery = (baseQuery: string) => {
    if (!effectiveGender) return baseQuery;
    
    const gender = effectiveGender.toLowerCase();
    
    // Add gender-specific terms to the base query
    switch (gender) {
      case 'male':
      case 'men':
        return `${baseQuery} men male`;
      case 'female':
      case 'women':
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
    query: getGenderSpecificQuery('coat jacket overcoat blazer'),
    first: 8,
  });

  const {
    products: topProducts,
    loading: loadingTop,
    error: errorTop,
  } = useProductSearch({
    query: getGenderSpecificQuery('tshirt t-shirt inner undershirt shirt'),
    first: 8,
  });

  const {
    products: bottomProducts,
    loading: loadingBottom,
    error: errorBottom,
  } = useProductSearch({
    query: getGenderSpecificQuery('pants trousers jeans leggings'),
    first: 8,
  });

  // Fallback to popular products if search fails
  const { products: popularProducts, loading: loadingPopular } = usePopularProducts();

  // Debug logging (commented out for production)
  // console.log('Buyer attributes debug:', {
  //   genderAffinity: buyerAttributes?.genderAffinity,
  //   categoryAffinities: buyerAttributes?.categoryAffinities,
  //   loadingAttributes
  // });
  
  // console.log('Product search debug:', {
  //   outerwearProducts: outerwearProducts?.length || 0,
  //   topProducts: topProducts?.length || 0,
  //   bottomProducts: bottomProducts?.length || 0,
  //   popularProducts: popularProducts?.length || 0,
  //   errors: { errorOuterwear, errorTop, errorBottom }
  // });

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

  // Get products for specific slot type
  const getProductsForSlot = (slotIndex: number) => {
    const outerwearList = Array.isArray(outerwearProducts) ? outerwearProducts : (outerwearProducts as any)?.nodes ?? [];
    const topList = Array.isArray(topProducts) ? topProducts : (topProducts as any)?.nodes ?? [];
    const bottomList = Array.isArray(bottomProducts) ? bottomProducts : (bottomProducts as any)?.nodes ?? [];
    
    // If no products found, use popular products as fallback
    if (outerwearList.length === 0 && topList.length === 0 && bottomList.length === 0) {
      const popularList = Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? [];
      return popularList;
    }
    
    // Return products based on slot index
    switch (slotIndex) {
      case 0: // First slot - outerwear
        return outerwearList.length > 0 ? outerwearList : (Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? []);
      case 1: // Second slot - tops
        return topList.length > 0 ? topList : (Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? []);
      case 2: // Third slot - bottoms
        return bottomList.length > 0 ? bottomList : (Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? []);
      default:
        return (Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? []);
    }
  };

  const itemById = useMemo(() => {
    const allItems = [
      ...getProductsForSlot(0).map(productToItem),
      ...getProductsForSlot(1).map(productToItem),
      ...getProductsForSlot(2).map(productToItem)
    ];
    return new Map(allItems.map((i) => [i.id, i] as const));
  }, [outerwearProducts, topProducts, bottomProducts, popularProducts]);

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

  const loadingAny = loadingOuterwear || loadingTop || loadingBottom || loadingPopular || loadingAttributes;
  const errorAny = errorOuterwear || errorTop || errorBottom;

  // Calculate how many slots to show for each option
  const getVisibleSlots = (ids: string[]) => {
    const filledCount = ids.filter(id => id !== "").length;
    return Math.min(filledCount + 1, 3); // Show filled slots + 1 empty slot, max 3
  };

  const visibleSlotsA = getVisibleSlots(fitAIds);
  const visibleSlotsB = getVisibleSlots(fitBIds);

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
      // console.log('Selected for Option A:', { slot: picker.idx, productId: id, allAIds: next });
    } else {
      const next = [...fitBIds];
      next[picker.idx] = id;
      setFitBIds(next);
      // console.log('Selected for Option B:', { slot: picker.idx, productId: id, allBIds: next });
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

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setShowGenderPrompt(false);
  };

  const Slot = ({ id, onClick, isVisible }: { id?: string; onClick: () => void; isVisible: boolean }) => {
    const item = id ? itemById.get(id) : undefined;
    
    if (!isVisible) return null;
    
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

  // Get current slot products for the modal
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
      <div className="pt-4 pb-28 px-5">
        <div className="mb-3 flex flex-col items-center">
          <Button onClick={() => navigate("/")} className="text-black text-2xl">
            ←
          </Button>
        </div>
        <div className="w-full mb-4">
          <h2 className="text-2xl font-bold text-center">Select your preference</h2>
          <p className="text-center text-gray-600 mt-2">
            Help us show you the most relevant products
          </p>
        </div>
        
        <div className="flex flex-col gap-4 mt-8">
          <Button 
            onClick={() => handleGenderSelect('male')}
            className="py-4 text-lg"
          >
            Men's Products
          </Button>
          <Button 
            onClick={() => handleGenderSelect('female')}
            className="py-4 text-lg"
          >
            Women's Products
          </Button>
          <Button 
            onClick={() => handleGenderSelect('unisex')}
            className="py-4 text-lg"
          >
            Show All Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-28 px-5">
      <div className="mb-3 flex flex-col items-center">
        <Button onClick={() => navigate("/")} className="text-black text-2xl">
          ←
        </Button>
      </div>
        <div className="w-full mb-1">
          <h2 className="text-2xl font-bold text-center">Create your poll</h2>
        </div>

      {loadingAny && (
        <div className="mb-3 text-center text-sm text-gray-600">
          {loadingAttributes ? "Loading your preferences..." : "Searching for products…"}
        </div>
      )}
      {errorAny && (
        <div className="mb-3 text-center text-sm text-red-600">
          Couldn't search for products. Using popular products instead.
        </div>
      )}
      
      {effectiveGender && (
        <div className="mb-3 text-center text-sm text-blue-600">
          Showing {effectiveGender === 'male' ? 'men' : effectiveGender === 'female' ? 'women' : 'all'} products for you
        </div>
      )}
      
      {/* //Debug: Show buyer attributes info
      <div className="mb-3 text-center text-xs text-gray-500">
        Gender: {buyerAttributes?.genderAffinity || 'Not detected'} | 
        Loading: {loadingAttributes ? 'Yes' : 'No'} | 
        Has Data: {buyerAttributes ? 'Yes' : 'No'}
      </div> */}

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
        className="w-full rounded-xl bg-gray-200 p-4 max-h-12 mb-4"
        placeholder="Description"
      />

      <Button onClick={publish} disabled={!canPublish || loadingAny}>
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

