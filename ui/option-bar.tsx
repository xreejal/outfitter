import { useState } from "react";
import { Button } from "@shopify/shop-minis-react";
import { Plus, X, Sparkles, Settings } from "lucide-react";

const FabMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="right-6 bottom-6 z-50 fixed">
      {/* Actions */}
      <div
        className="flex flex-col items-center gap-3 mb-3"
        aria-hidden={!open}
      >
        {open && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white/95 shadow-lg backdrop-blur-sm border-white/20 rounded-full w-12 h-12 transition-all animate-enter duration-200"
              onClick={() => {
                setOpen(false);
              }}
              aria-label="Do magic"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white/95 shadow-lg backdrop-blur-sm border-white/20 rounded-full w-12 h-12 transition-all animate-enter duration-200"
              onClick={() => {
                setOpen(false);
              }}
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
      {/* Main FAB */}
      <Button
        variant="default"
        size="lg"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full w-14 h-14 text-white transition-all duration-200"
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
};

export default FabMenu;