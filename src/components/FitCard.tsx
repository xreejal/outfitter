import React from "react";
import { Fit, Item } from "../types";
import { useSaved } from "../contexts/SavedContext";

export default function FitCard({
  fit,
  items,
  pollId,
  selected,
  onSelect,
}: {
  fit: Fit;
  items: Item[];
  pollId: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(pollId, fit.id);

  return (
    <div
      className={`relative rounded-xl bg-gray-100 p-3 ${selected ? "ring-2 ring-gray-600" : ""}`}
    >
      <button
        onClick={() => onSelect?.()}
        className="absolute inset-0 rounded-xl"
        aria-label="select fit"
      />
      <div className="grid grid-cols-3 gap-2">
        {fit.itemIds.map((id) => {
          const item = items.find((i) => i.id === id);
          return (
            <div
              key={id}
              className="aspect-square rounded-lg overflow-hidden bg-white"
            >
              {item && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="font-medium">{fit.name}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(pollId, fit.id, fit.name === "A" ? "A" : "B");
          }}
          className={`text-sm ${saved ? "text-gray-800" : "text-gray-600"}`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
