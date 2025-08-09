import React from "react";
import { Item } from "../types";

export default function ItemPickerModal({
  open,
  onClose,
  items,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  items: Item[];
  onSelect: (item: Item) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
      <div className="bg-white w-full max-h-[70vh] rounded-t-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Pick an item</h3>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it) => (
            <button
              key={it.id}
              className="border rounded-lg p-2 text-left"
              onClick={() => {
                onSelect(it);
                onClose();
              }}
            >
              <div className="aspect-square w-full bg-gray-100 rounded mb-2 overflow-hidden">
                <img
                  src={it.imageUrl}
                  alt={it.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-medium line-clamp-2">{it.title}</div>
              <div className="text-[10px] text-gray-500">{it.merchant}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
