import React from "react";

export default function Landing({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  return (
    <div className="pt-8 pb-28 px-4">
      <h1 className="text-2xl font-bold text-center mb-12">
        Outfit Fit Battler
      </h1>
      <div className="flex flex-col items-center gap-4 mt-24">
        <button
          onClick={() => navigate("/vote")}
          className="w-64 py-6 rounded-xl bg-gray-200"
        >
          choose fits
        </button>
        <button
          disabled
          className="w-64 py-6 rounded-xl bg-gray-200 opacity-60"
        >
          fit battles (P1)
        </button>
      </div>
    </div>
  );
}
