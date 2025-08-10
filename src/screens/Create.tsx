import { useMemo, useState } from "react";
import { useCatalog } from "../contexts/CatalogContext";
import ItemPickerModal from "../components/ItemPickerModal";
import { Fit } from "../types";
import { usePolls } from "../contexts/PollsContext";
import { useUser } from "../contexts/UserContext";
import {Button} from '@shopify/shop-minis-react'

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
    <div className="pt-4 pb-28 px-5">
      <div className="mb-3 flex flex-col items-center">
        <Button onClick={() => navigate("/")} className="bg-white-500 text-black text-2xl">
          ←
        </Button>
        <div className="w-full mb-4">
        <h2 className="text-2xl font-bold text-center">Create your poll</h2>
        </div>
        </div>
        <div className="w-12" />
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
        className="w-full rounded-xl bg-gray-200 p-4 max-h-12 mb-4 "
        placeholder="Description"
      />
      <Button
        onClick={publish}
      >
        Publish
      </Button>

      <ItemPickerModal
        open={picker.open}
        onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
        items={items}
        onSelect={(it) => placeItem(it.id)}
      />
    </div>
  );
}

// src/screens/Create.tsx
// import { useMemo, useState } from "react";
// import ItemPickerModal from "../components/ItemPickerModal";
// import { Fit, Item } from "../types";
// import { usePolls } from "../contexts/PollsContext";
// import { useUser } from "../contexts/UserContext";
// import { Button, useCuratedProducts } from "@shopify/shop-minis-react";

// export default function Create({ navigate }: { navigate: (path: string) => void }) {
//   const { createPoll } = usePolls();
//   const user = useUser();

//   const { products, loading, error, hasNextPage, fetchMore, refetch } =
//     useCuratedProducts({
//       handle: "popular",
//       requiredTags: ["outerwear", "outfit", "tops", "bottoms", "shoes", "accessories"],
//     });

//   const productToItem = (p: any): Item => {
//     const imageUrl =
//       p?.image?.url ??
//       p?.featuredImage?.url ??
//       p?.images?.[0]?.url ??
//       p?.images?.[0]?.src ??
//       "";

//     const rawPrice =
//       p?.price?.amount ??
//       p?.minPrice?.amount ??
//       p?.priceRange?.minVariantPrice?.amount ??
//       p?.variants?.[0]?.price?.amount ??
//       "";

//     const price = typeof rawPrice === "string" ? rawPrice : rawPrice?.toString?.() ?? "";

//     return {
//       id: String(p?.id ?? ""),
//       title: String(p?.title ?? "Untitled"),
//       imageUrl,
//       price,
//       merchant: String(p?.vendor ?? p?.merchant ?? "Unknown"),
//       category:
//         (Array.isArray(p?.tags) && p.tags[0]) || p?.productType || p?.category || "",
//     };
//   };

//   // Handle both array and {nodes}
//   const curatedItems: Item[] = useMemo(() => {
//     const list = Array.isArray(products) ? products : products?.nodes ?? [];
//     return (list ?? []).map(productToItem);
//   }, [products]);

//   const itemById = useMemo(
//     () => new Map(curatedItems.map((i) => [i.id, i] as const)),
//     [curatedItems]
//   );

//   const [nameA, setNameA] = useState("A");
//   const [nameB, setNameB] = useState("B");
//   const [desc, setDesc] = useState("");
//   const [fitAIds, setFitAIds] = useState<string[]>(["", "", ""]);
//   const [fitBIds, setFitBIds] = useState<string[]>(["", "", ""]);

//   const [picker, setPicker] = useState<{ open: boolean; col: "A" | "B"; idx: number }>({
//     open: false,
//     col: "A",
//     idx: 0,
//   });

//   const canPublish = useMemo(
//     () => desc.trim().length > 0 && fitAIds.every(Boolean) && fitBIds.every(Boolean),
//     [desc, fitAIds, fitBIds]
//   );

//   function select(col: "A" | "B", idx: number) {
//     setPicker({ open: true, col, idx });
//   }

//   function placeItem(id: string) {
//     if (picker.col === "A") {
//       const next = [...fitAIds];
//       next[picker.idx] = id;
//       setFitAIds(next);
//     } else {
//       const next = [...fitBIds];
//       next[picker.idx] = id;
//       setFitBIds(next);
//     }
//     setPicker((prev) => ({ ...prev, open: false }));
//   }

//   function publish() {
//     if (!canPublish) return;
//     const fitA: Fit = { id: `fit_${Date.now()}_A`, name: nameA || "A", itemIds: fitAIds };
//     const fitB: Fit = { id: `fit_${Date.now()}_B`, name: nameB || "B", itemIds: fitBIds };
//     createPoll({ description: desc, fitA, fitB }, user.id);
//     alert("Published!");
//     navigate("/vote");
//   }

//   const Slot = ({ id, onClick }: { id?: string; onClick: () => void }) => {
//     const item = id ? itemById.get(id) : undefined;
//     return (
//       <button
//         onClick={onClick}
//         className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center overflow-hidden"
//         // allow opening even while loading, so users see the picker screen
//         title={loading ? "Loading products..." : undefined}
//       >
//         {item ? (
//           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
//         ) : (
//           <span className="text-2xl">{loading ? "…" : "+"}</span>
//         )}
//       </button>
//     );
//   };

//   return (
//     <div className="pt-4 pb-28 px-5">
//       <div className="mb-3 flex flex-col items-center">
//         <Button onClick={() => navigate("/")} className="text-black text-2xl">
//           ←
//         </Button>
//         <div className="w-full mb-4">
//           <h2 className="text-2xl font-bold text-center">Create your poll</h2>
//         </div>
//       </div>

//       {loading && (
//         <div className="mb-3 text-center text-sm text-gray-600">Loading popular products…</div>
//       )}
//       {error && (
//         <div className="mb-3 text-center text-sm text-red-600">
//           Couldn’t load curated products.{" "}
//           <button className="underline" onClick={() => refetch()} type="button">
//             Try again
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <input
//           value={nameA}
//           onChange={(e) => setNameA(e.target.value)}
//           className="bg-gray-200 rounded px-3 py-2"
//           placeholder="name of fit"
//         />
//         <input
//           value={nameB}
//           onChange={(e) => setNameB(e.target.value)}
//           className="bg-gray-200 rounded px-3 py-2"
//           placeholder="name of fit"
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-6 items-start mb-6">
//         <div className="flex flex-col items-center gap-6">
//           {fitAIds.map((id, idx) => (
//             <Slot key={idx} id={id} onClick={() => select("A", idx)} />
//           ))}
//         </div>
//         <div className="flex flex-col items-center gap-6">
//           {fitBIds.map((id, idx) => (
//             <Slot key={idx} id={id} onClick={() => select("B", idx)} />
//           ))}
//         </div>
//       </div>

//       <textarea
//         value={desc}
//         onChange={(e) => setDesc(e.target.value)}
//         className="w-full rounded-xl bg-gray-200 p-4 max-h-12 mb-4"
//         placeholder="Description"
//       />

//       <div className="flex items-center gap-3">
//         <Button onClick={publish} disabled={!canPublish || loading}>
//           Publish
//         </Button>
//         {hasNextPage && (
//           <Button onClick={fetchMore} disabled={loading}>
//             Load more products
//           </Button>
//         )}
//       </div>

//       <ItemPickerModal
//         open={picker.open}
//         onClose={() => setPicker((prev) => ({ ...prev, open: false }))}
//         items={curatedItems}
//         onSelect={(item) => placeItem(item.id)}
//       />
//     </div>
//   );
// }

