import { useState } from "react";
import { useCatalog } from "../contexts/CatalogContext";
import ItemPickerModal from "../component/create/ItemPickerModal";
import { Fit } from "../types";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";
import { Button } from "@shopify/shop-minis-react";

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

  // const canPublish = useMemo(
  //   () =>
  //     desc.trim().length > 0 &&
  //     fitAIds.every(Boolean) &&
  //     fitBIds.every(Boolean),
  //   [desc, fitAIds, fitBIds]
  // );

  const canPublish = true;

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
    navigate("/");
  }

  const Slot = ({ id, onClick }: { id?: string; onClick: () => void }) => {
    const item = items.find((i) => i.id === id);
    return (
      <button
        onClick={onClick}
        className="flex justify-center items-center border-2 border-white/20 rounded-full w-20 h-20 overflow-hidden hover:scale-105 transition-transform duration-200 glass-card"
      >
        {item ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white/70 text-2xl">+</span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black px-5 pt-4 pb-28 min-h-screen">
      <div className="flex items-start mb-6">
        <Button
          onClick={() => navigate("/")}
          className="glass-card border border-white/20 hover:bg-white/10 px-2 py-1 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
        >
          ←
        </Button>
        <div className="mb-6 w-full">
          <h2 className="mb-2 font-bold text-white text-3xl text-center">Create your poll</h2>
          <p className="text-white/70 text-sm text-center">Design two amazing outfits and let the community decide!</p>
        </div>
      </div>
      
      <div className="mb-6 p-6 glass-card">
        <h3 className="mb-4 font-semibold text-white text-lg text-center">Outfit Names</h3>
        <div className="gap-4 grid grid-cols-2">
          <input
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            className="w-full glass-input"
            placeholder="Name of fit A"
          />
          <input
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            className="w-full glass-input"
            placeholder="Name of fit B"
          />
        </div>
      </div>

      <div className="mb-6 p-6 glass-card">
        <h3 className="mb-4 font-semibold text-white text-lg text-center">Select Items</h3>
        <div className="items-start gap-6 grid grid-cols-2">
          <div className="flex flex-col items-center gap-6">
            <div className="mb-2 text-center">
              <span className="font-medium text-white/80 text-sm">{nameA || 'Fit A'}</span>
            </div>
            {fitAIds.map((id, idx) => (
              <Slot key={idx} id={id} onClick={() => select("A", idx)} />
            ))}
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="mb-2 text-center">
              <span className="font-medium text-white/80 text-sm">{nameB || 'Fit B'}</span>
            </div>
            {fitBIds.map((id, idx) => (
              <Slot key={idx} id={id} onClick={() => select("B", idx)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 p-6 glass-card">
        <h3 className="mb-4 font-semibold text-white text-lg text-center">Poll Description</h3>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full min-h-[80px] resize-none glass-input"
          placeholder="Describe what you're comparing or asking the community to vote on..."
        />
      </div>

      <div className="flex justify-center">
        <button 
          onClick={publish}
          className="w-full max-w-md liquid-glass-primary"
        >
          <span className="button-text">Publish Poll</span>
        </button>
      </div>

      <ItemPickerModal
        open={picker.open}
        onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
        items={items}
        onSelect={(it: { id: string }) => placeItem(it.id)}
      />
    </div>
  );
}
