import { useMemo, useState } from "react";
import ItemPickerModal from "../create/ItemPickerModal";
import { Fit, Item } from "../../types";
import { usePolls } from "../../contexts/PollsContext";
import { useUser } from "../../contexts/UserContext";
import {
  Button,
  useProductSearch,
  usePopularProducts,
} from "@shopify/shop-minis-react";

// Category data structure
const CATEGORIES = {
  men: {
    "Shirts & Tops": ["T-shirts", "Shirts", "Hoodies", "Polos", "Sweatshirts", "Tank Tops"],
    "Shoes": ["Sneakers", "Slippers", "Sandals", "Boots", "Flats", "Athletic shoes"],
    "Pants": ["Jeans", "Chinos", "Cargo pants", "Dress pants", "Sweatpants", "Shorts"],
    "Socks": ["Ankle socks", "Crew socks", "Dress socks", "Athletic socks"],
    "ActiveWear": ["Shorts", "Tops", "Sweatshirts & Hoodies", "Pants"],
    "Shorts": ["Casual shorts", "Athletic shorts", "Dress shorts"],
    "Sleepwear & Loungewear": ["Pajamas", "Loungewear", "Robes"],
    "Swimwear": ["Swim trunks", "Board shorts", "Rash guards"],
    "Coats & Jackets": ["Winter coats", "Jackets", "Blazers", "Bomber jackets"]
  },
  women: {
    "Shirts & Tops": ["T-shirts", "Shirts", "Hoodies", "Sweatshirts", "Tank Tops"],
    "Shoes": ["Sneakers", "Slippers", "Sandals", "Boots", "Flats", "Athletic shoes", "Heels"],
    "Dresses": ["Casual dresses", "Formal dresses", "Summer dresses", "Cocktail dresses"],
    "Pants": ["Jeans", "Leggings", "Chinos", "Dress pants", "Sweatpants", "Shorts"],
    "Activewear": ["Shorts", "Leggings", "Travel", "Sports bras", "Pants", "Sweatshirts & Hoodies"],
    "Swimwear": ["Bikinis", "One-pieces", "Cover-ups"],
    "Shorts": ["Casual shorts", "Athletic shorts", "Dress shorts"],
    "Sleepwear & Loungewear": ["Pajamas", "Loungewear", "Robes"],
    "Coats & Jackets": ["Winter coats", "Jackets", "Blazers", "Trench coats"],
    "Jumpsuits & Rompers": ["Jumpsuits", "Rompers", "Playsuits"],
    "Skirts": ["Mini skirts", "Midi skirts", "Maxi skirts", "Pencil skirts"]
  }
};

export default function Create({ navigate }: { navigate: (path: string) => void }) {
  const { createPoll } = usePolls();
  const user = useUser();
  
  // Category selection state
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showCategoryPrompt, setShowCategoryPrompt] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Show category prompt if no gender selected
  useMemo(() => {
    if (!selectedGender) {
      setShowCategoryPrompt(true);
    }
  }, [selectedGender]);

  // Build search query from selected categories
  const buildSearchQuery = (subcategory: string) => {
    if (!selectedGender) return subcategory;
    
    // Find the main category for this subcategory
    const genderCategories = CATEGORIES[selectedGender as keyof typeof CATEGORIES];
    let mainCategory = "";
    
    for (const [main, subs] of Object.entries(genderCategories)) {
      if (subs.includes(subcategory)) {
        mainCategory = main;
        break;
      }
    }
    
    // Build query: subcategory -> main category -> gender
    const query = [subcategory, mainCategory, selectedGender].filter(Boolean).join(" ");
    return query;
  };

  // Search for products by slot type with category-based queries
  const {
    products: slot1Products,
    loading: loadingSlot1,
    error: errorSlot1,
    fetchMore: fetchMoreSlot1,
    hasNextPage: hasNextSlot1,
  } = useProductSearch({
    query: selectedCategories[0] ? buildSearchQuery(selectedCategories[0]) : "popular clothing",
    first: 10,
  });

  const {
    products: slot2Products,
    loading: loadingSlot2,
    error: errorSlot2,
    fetchMore: fetchMoreSlot2,
    hasNextPage: hasNextSlot2,
  } = useProductSearch({
    query: selectedCategories[1] ? buildSearchQuery(selectedCategories[1]) : "popular clothing",
    first: 10,
  });

  const {
    products: slot3Products,
    loading: loadingSlot3,
    error: errorSlot3,
    fetchMore: fetchMoreSlot3,
    hasNextPage: hasNextSlot3,
  } = useProductSearch({
    query: selectedCategories[2] ? buildSearchQuery(selectedCategories[2]) : "popular clothing",
    first: 10,
  });

  // Fallback to popular products if search fails
  const { products: popularProducts, loading: loadingPopular } = usePopularProducts();

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

    const slotProducts = [slot1Products, slot2Products, slot3Products][slotIndex];
    const slotList = Array.isArray(slotProducts) ? slotProducts : (slotProducts as any)?.nodes ?? [];
    
    // If no products found, use popular products as fallback
    if (slotList.length === 0) {
      const popularList = Array.isArray(popularProducts) ? popularProducts : (popularProducts as any)?.nodes ?? [];
      return popularList;
    }
    
    return slotList;
  };

  // Get fetchMore function for specific slot type
  const getFetchMoreForSlot = (slotIndex: number) => {
    const fetchMoreFunctions = [fetchMoreSlot1, fetchMoreSlot2, fetchMoreSlot3];
    return fetchMoreFunctions[slotIndex] || (() => Promise.resolve());
  };

  // Get hasNextPage for specific slot type
  const getHasNextPageForSlot = (slotIndex: number) => {
    const hasNextPages = [hasNextSlot1, hasNextSlot2, hasNextSlot3];
    return hasNextPages[slotIndex] || false;
  };

  const itemById = useMemo(() => {
    const allItems = [
      ...getProductsForSlot(0).map(productToItem),
      ...getProductsForSlot(1).map(productToItem),
      ...getProductsForSlot(2).map(productToItem)
    ];
    return new Map(allItems.map((i) => [i.id, i] as const));
  }, [slot1Products, slot2Products, slot3Products, popularProducts]);


  const nameA = "A";
  const nameB = "B";
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

  const loadingAny = loadingSlot1 || loadingSlot2 || loadingSlot3 || loadingPopular;
  const errorAny = errorSlot1 || errorSlot2 || errorSlot3;

  // Show all 3 slots from the start
  const visibleSlotsA = 3;
  const visibleSlotsB = 3;

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
    
    // Add enhanced slot "receive" animation
    setTimeout(() => {
      const slotElement = document.querySelector(`[data-slot="${picker.col}-${picker.idx}"]`) as HTMLElement;
      if (slotElement) {
        // Create a pulsing glow effect
        slotElement.style.transform = 'scale(1.15)';
        slotElement.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)';
        slotElement.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        slotElement.style.borderColor = 'rgb(59, 130, 246)';
        
        // Add a subtle bounce effect
        setTimeout(() => {
          slotElement.style.transform = 'scale(0.95)';
          slotElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.6)';
          
          setTimeout(() => {
            slotElement.style.transform = 'scale(1.05)';
            slotElement.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
            
            setTimeout(() => {
              slotElement.style.transform = 'scale(1)';
              slotElement.style.boxShadow = '';
              slotElement.style.borderColor = '';
            }, 200);
          }, 150);
        }, 300);
      }
    }, 800); // Delay to match the flying animation
  }



  async function publish() {
    if (!canPublish) return;
    
    setIsPublishing(true);
    
    try {
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
      
      // Add a small delay for the animation to be visible
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Failed to publish poll:", error);
      setIsPublishing(false);
    }
  }

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    setSelectedCategories([]); // Reset categories when gender changes
    setExpandedCategories([]); // Reset expanded categories
  };

  const toggleCategoryExpansion = (mainCategory: string) => {
    setExpandedCategories(prev => 
      prev.includes(mainCategory) 
        ? prev.filter(cat => cat !== mainCategory)
        : [...prev, mainCategory]
    );
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(cat => cat !== subcategory);
      } else if (prev.length < 3) {
        return [...prev, subcategory];
      }
      return prev; // Don't add if already at max
    });
  };

  const handleContinueToOutfit = () => {
    if (selectedCategories.length === 3) {
      setShowCategoryPrompt(false);
    }
  };

  const Slot = ({ id, onClick, isVisible, slotInfo, categoryName }: { id?: string; onClick: () => void; isVisible: boolean; slotInfo: string; categoryName?: string }) => {
    const item = id ? itemById.get(id) : undefined;
    
    if (!isVisible) return null;
    
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onClick}
          className="w-28 h-28 rounded-2xl glass-card border-2 border-white/30 hover:border-white/50 flex items-center justify-center overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          title={loadingAny ? "Loading products..." : undefined}
          data-slot={slotInfo}
        >
          {item ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl text-white/70 font-bold">{loadingAny ? "…" : "+"}</span>
          )}
        </button>
        {categoryName && (
          <span className="text-xs text-white/60 text-center font-medium">
            {categoryName}
          </span>
        )}
      </div>
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

  // Get current slot pagination functions
  const getCurrentSlotFetchMore = () => {
    if (!picker.open) return () => Promise.resolve();
    return getFetchMoreForSlot(picker.idx);
  };

  const getCurrentSlotHasNextPage = () => {
    if (!picker.open) return false;
    return getHasNextPageForSlot(picker.idx);
  };

  // Category selection prompt
  if (showCategoryPrompt) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen pt-4 pb-28 px-5">
        <div className="flex items-center mb-3">
          <button
            onClick={() => navigate?.("/")}
            className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Select your style</h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm mx-auto">
            Choose exactly 3 categories.
          </p>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm mx-auto">
            Each category will become a slot in your outfit!
          </p>
        </div>

        {/* Gender Selection */}
        {!selectedGender && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Select Gender</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleGenderSelect('men')}
                className="glass-card border border-white/20 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
              >
                Men's
              </button>
              <button 
                onClick={() => handleGenderSelect('women')}
                className="glass-card border border-white/20 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
              >
                Women's
              </button>
            </div>
          </div>
        )}

        {/* Category Selection */}
        {selectedGender && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedGender === 'men' ? "Men's" : "Women's"} Categories
              </h3>
              <div className="text-sm text-white/60">
                {selectedCategories.length}/3 selected
              </div>
            </div>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
              <div className="mb-4 p-3 glass-card border border-white/20 rounded-lg">
                <div className="text-sm text-white/70 mb-2">Selected:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category, index) => (
                    <span 
                      key={index}
                      className="glass-card border border-white/30 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {category}
                      <button 
                        onClick={() => handleSubcategorySelect(category)}
                        className="text-white hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Accordion */}
            <div className="space-y-2">
              {Object.entries(CATEGORIES[selectedGender as keyof typeof CATEGORIES]).map(([mainCategory, subcategories]) => (
                <div key={mainCategory} className="glass-card border border-white/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategoryExpansion(mainCategory)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">{mainCategory}</span>
                    <span className="text-white/60">
                      {expandedCategories.includes(mainCategory) ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedCategories.includes(mainCategory) && (
                    <div className="px-4 pb-4 space-y-2">
                      {subcategories.map((subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() => handleSubcategorySelect(subcategory)}
                          className={`w-full text-left p-2 rounded transition-colors ${
                            selectedCategories.includes(subcategory)
                              ? 'glass-card border border-white/30 text-white'
                              : 'text-white/70 hover:bg-white/10'
                          }`}
                          disabled={!selectedCategories.includes(subcategory) && selectedCategories.length >= 3}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fixed Footer with Continue Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-white/20 p-4 z-10">
              <Button
                onClick={handleContinueToOutfit}
                disabled={selectedCategories.length !== 3}
                className={`w-full font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                  selectedCategories.length === 3
                    ? 'glass-card border border-white/20 text-white hover:bg-white/10'
                    : 'glass-card border border-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {selectedCategories.length === 3 
                  ? 'Continue to Outfit Builder' 
                  : `Select ${3 - selectedCategories.length} more categor${3 - selectedCategories.length === 1 ? 'y' : 'ies'}`
                }
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-4 pb-28 px-5 overflow-y-auto">  
      <div className="flex items-center mb-3">
          <button
            onClick={() => navigate?.("/")}
            className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>
      <div className="w-full mb-1">
        <h2 className="text-2xl font-bold text-center text-white">Create your poll</h2>
      </div>

      {loadingAny && (
        <div className="mb-3 text-center text-sm text-white/70">
          Searching for products…
        </div>
      )}
      {errorAny && (
        <div className="mb-3 text-center text-sm text-red-400">
          Couldn't search for products. Using popular products instead.
        </div>
      )}
      
             {selectedCategories.length > 0 && (
         <div className="mb-3 text-center text-sm text-white/80">
           Building outfit with: {selectedCategories.join(", ")}
         </div>
       )}

               {/* Outfit Selection Container */}
        <div className="glass-card border border-white/20 rounded-xl p-6 mb-6">
          {/* Outfit Labels */}
          <div className="grid grid-cols-2 gap-8 mb-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">A</h3>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">B</h3>
            </div>
          </div>

                     <div className="grid grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              {fitAIds.map((id, idx) => (
                <Slot 
                  key={idx} 
                  id={id} 
                  onClick={() => select("A", idx)} 
                  isVisible={idx < visibleSlotsA}
                  slotInfo={`A-${idx}`}
                  categoryName={selectedCategories[idx]}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-4">
              {fitBIds.map((id, idx) => (
                <Slot 
                  key={idx} 
                  id={id} 
                  onClick={() => select("B", idx)} 
                  isVisible={idx < visibleSlotsB}
                  slotInfo={`B-${idx}`}
                  categoryName={selectedCategories[idx]}
                />
              ))}
            </div>
          </div>
        </div>

             <textarea
         value={desc}
         onChange={(e) => setDesc(e.target.value)}
         className="w-full rounded-xl glass-card text-white border border-white/20 p-4 max-h-12 mb-20 placeholder-white/50 focus:outline-none focus:border-white/40"
         placeholder="Description"
       />

               {/* Fixed Footer with Publish Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-white/20 p-4 z-10">
          <Button 
            onClick={publish} 
            disabled={!canPublish || loadingAny || isPublishing}
            className="w-full glass-card border border-white/20 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-200"
          >
            {isPublishing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Publishing...</span>
              </div>
            ) : (
              "Publish"
            )}
          </Button>
        </div>

             <ItemPickerModal
         open={picker.open}
         onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
         items={getCurrentSlotItems()}
         onSelect={(item) => placeItem(item.id)}
         products={getCurrentSlotProducts()}
         fetchMore={getCurrentSlotFetchMore()}
         hasNextPage={getCurrentSlotHasNextPage()}
         loading={loadingAny}
       />

                       {/* Publishing Loading Animation */}
        {isPublishing && (
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex items-center justify-center">
            <div className="text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Publishing Your Poll...
              </h3>
              <p className="text-white/60 text-sm">
                Taking you to home...
              </p>
            </div>
          </div>
        )}
     </div>
   );
 }
