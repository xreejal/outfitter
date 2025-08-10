import { ReactNode } from "react";

export default function ExpandModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close expand modal"
      />
      <div className="absolute inset-x-4 bottom-10 top-20 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl overflow-auto">
        {children}
      </div>
    </div>
  );
}
