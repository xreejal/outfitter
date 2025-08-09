import React, { useMemo, useState } from "react";
import { useCatalog } from "../contexts/CatalogContext";
import ItemPickerModal from "../components/ItemPickerModal";
import { Fit } from "../types";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";

export default function Create({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const { items } = useCatalog();
  const { createPoll } = usePolls();
  const user = useUser();

  const [nameA, setNameA] = useState("A");
  const [nameB, setNameB] = useState("B");
  const [desc, setDesc] = useState("");
  const [fitAIds, setFitAIds] = useState<string[]>(["", "", ""]);
  const [fitBIds, setFitBIds] = useState<string[]>(["", "", ""]);

  const [picker, setPicker] = useState<{
    open: boolean;
    col: "A" | "B";
    idx: number;
  }>({ open: false, col: "A", idx: 0 });

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
    } else {
      const next = [...fitBIds];
      next[picker.idx] = id;
      setFitBIds(next);
    }
  }

  function publish() {
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
    createPoll({ description: desc, fitA, fitB }, user.id);
    alert("Published!");
    navigate("/vote");
  }

  const Slot = ({ id, onClick }: { id?: string; onClick: () => void }) => {
    const item = items.find((i) => i.id === id);
    return (
      <button
        onClick={onClick}
        className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center overflow-hidden"
      >
        {item ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">+</span>
        )}
      </button>
    );
  };

  return (
    <div className="pt-6 pb-28 px-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigate("/")} className="text-sm text-blue-600">
          ← back
        </button>
        <h2 className="text-xl font-semibold text-center flex-1">Create</h2>
        <div className="w-12" />
      </div>
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
        className="w-full rounded-xl bg-gray-200 p-4 min-h-28"
        placeholder="description"
      />
      <button
        disabled={!canPublish}
        onClick={publish}
        className={`mt-6 w-full py-4 rounded-xl ${canPublish ? "bg-black text-white" : "bg-gray-300 text-gray-500"}`}
      >
        publish
      </button>

      <ItemPickerModal
        open={picker.open}
        onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
        items={items}
        onSelect={(it) => placeItem(it.id)}
      />
    </div>
  );
}
