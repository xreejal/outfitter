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
}

export default function ItemPickerModal({
  open,
  onClose,
  items,
  onSelect,
  products,
}: Props) {
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
      onSelect(item);
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
        className="absolute inset-0 bg-black/40 z-0"
        onClick={onClose}
        tabIndex={-1}
      />

      {/* Panel */}
      <div className="absolute inset-0 bg-white flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Pick an item</h2>
          <Button
            ref={firstFocusable as any}
            onClick={onClose}
            className="text-black"
            aria-label="Close item picker"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {(!products || products.length === 0) && items.length === 0 ? (
            <div className="text-center text-sm text-gray-500">
              No items yet—still loading?
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products && products.length > 0
                ? products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div
                        onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                          handleProductClick(e, product)
                        }
                      >
                        <ProductCard
                          product={product}
                          onFavoriteToggled={handleFavoriteToggled}
                        />
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <Button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                            handleProductClick(e, product)
                          }
                          size="sm"
                          className="w-full"
                        >
                          Select for Slot
                        </Button>
                      </div>
                    </div>
                  ))
                : items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="w-full h-32 overflow-hidden mb-2">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.price && `$${item.price}`}
                        </div>
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <Button
                          onClick={() => onSelect(item)}
                          size="sm"
                          className="w-full"
                        >
                          Select for Slot
                        </Button>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
