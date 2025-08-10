import { useEffect, useRef } from "react";
import { Button, ProductCard } from "@shopify/shop-minis-react";

interface Item {
  id: string;
  title: string;
  imageUrl: string;
  price?: string | number;
  merchant?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: Item[];
  onSelect: (item: Item) => void;
  products?: any[]; // Original Shopify products
  fetchMore?: () => Promise<void>;
  hasNextPage?: boolean;
  loading?: boolean;
}

export default function ItemPickerModal({ open, onClose, items, onSelect, products, fetchMore, hasNextPage, loading }: Props) {
  const firstFocusable = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) firstFocusable.current?.focus();
  }, [open]);

  const handleFavoriteToggled = () => {
    // console.log('Favorite toggled');
  };

  const handleProductClick = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
    product: any
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const item = items.find((item) => item.id === String(product.id));
    if (item) {
      const productCard = (e.currentTarget as HTMLElement).closest('.product-card') as HTMLElement;
      const rect = productCard.getBoundingClientRect();
      
      const flyingElement = document.createElement('div');
      flyingElement.style.position = 'fixed';
      flyingElement.style.left = `${rect.left}px`;
      flyingElement.style.top = `${rect.top}px`;
      flyingElement.style.width = `${rect.width}px`;
      flyingElement.style.height = `${rect.height}px`;
      flyingElement.style.zIndex = '9999';
      flyingElement.style.pointerEvents = 'none';
      flyingElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      flyingElement.style.borderRadius = '12px';
      flyingElement.style.overflow = 'hidden';
      flyingElement.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      flyingElement.style.backgroundColor = 'white';
      flyingElement.innerHTML = productCard.innerHTML;
      
      document.body.appendChild(flyingElement);
      
      setTimeout(() => {
        flyingElement.style.transform = 'scale(0.8) rotate(5deg)';
        flyingElement.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
        
        setTimeout(() => {
          flyingElement.style.transform = 'scale(1.2) rotate(-5deg) translateY(-20px)';
          
          setTimeout(() => {
            flyingElement.style.transform = 'scale(0.6) rotate(0deg) translateY(-100px) translateX(-50px)';
            flyingElement.style.opacity = '0.8';
            
            setTimeout(() => {
              document.body.removeChild(flyingElement);
              onSelect(item);
            }, 400);
          }, 200);
        }, 150);
      }, 50);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999]"
      role="dialog"
      aria-modal="true"
      aria-label="Pick an item"
    >
      {/* Backdrop */}
      <button
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 z-0 transition-opacity duration-300 ease-in-out animate-in fade-in"
        onClick={onClose}
        tabIndex={-1}
      />

      {/* Panel */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col z-10 transform transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-full">
        {/* Header */}
        {/* <div className="flex items-center justify-between p-4 border-b border-white/20 glass-card">
          <Button
            ref={firstFocusable as any}
            onClick={onClose}
            className="text-white glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg font-bold text-lg"
            aria-label="Close item picker"
          >
            ✕
          </Button>
          <div className="flex-1"></div>
        </div> */}
        <div className="flex items-center ml-4 mt-4">
          <button
            ref={firstFocusable as any}
            onClick={onClose}
            aria-label="Close item picker"
            className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-8">
          {(!products || products.length === 0) && items.length === 0 ? (
            <div className="text-center text-sm text-white/60 mt-8">No items yet—still loading?</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="product-card glass-card border border-white/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <div onClick={(e: React.MouseEvent<HTMLDivElement>) => handleProductClick(e, product)} className="[&_*]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_span]:!text-white">
                        <ProductCard 
                          product={product}
                          onFavoriteToggled={handleFavoriteToggled}
                        />
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <Button 
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleProductClick(e, product)}
                          size="sm"
                          className="w-full glass-card border border-white/20 hover:bg-white/10 text-white font-medium py-2"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="product-card glass-card border border-white/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <div className="p-3">
                        <div className="w-full h-28 overflow-hidden mb-2">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium line-clamp-2 text-white">{item.title}</div>
                        <div className="text-xs text-white/60 mt-1">
                          {item.price && `$${item.price}`}
                        </div>
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <Button 
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const productCard = (e.currentTarget as HTMLElement).closest('.product-card') as HTMLElement;
                            const rect = productCard.getBoundingClientRect();
                            const flyingElement = document.createElement('div');
                            flyingElement.style.position = 'fixed';
                            flyingElement.style.left = `${rect.left}px`;
                            flyingElement.style.top = `${rect.top}px`;
                            flyingElement.style.width = `${rect.width}px`;
                            flyingElement.style.height = `${rect.height}px`;
                            flyingElement.style.zIndex = '9999';
                            flyingElement.style.pointerEvents = 'none';
                            flyingElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                            flyingElement.style.borderRadius = '12px';
                            flyingElement.style.overflow = 'hidden';
                            flyingElement.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
                            flyingElement.style.backgroundColor = 'white';
                            flyingElement.innerHTML = productCard.innerHTML;
                            document.body.appendChild(flyingElement);
                            setTimeout(() => {
                              flyingElement.style.transform = 'scale(0.8) rotate(5deg)';
                              flyingElement.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
                              setTimeout(() => {
                                flyingElement.style.transform = 'scale(1.2) rotate(-5deg) translateY(-20px)';
                                setTimeout(() => {
                                  flyingElement.style.transform = 'scale(0.6) rotate(0deg) translateY(-100px) translateX(-50px)';
                                  flyingElement.style.opacity = '0.8';
                                  setTimeout(() => {
                                    document.body.removeChild(flyingElement);
                                    onSelect(item);
                                  }, 400);
                                }, 200);
                              }, 150);
                            }, 50);
                          }}
                          size="sm"
                          className="w-full glass-card border border-white/20 hover:bg-white/10 text-white font-medium py-2"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {hasNextPage && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={fetchMore}
                    disabled={loading}
                    className="w-full glass-card border border-white/20 hover:bg-white/10 text-white font-bold py-3 transition-all duration-200"
                  >
                    {loading ? "Loading..." : "Show 10 More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
