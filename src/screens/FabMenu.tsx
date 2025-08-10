import { useState } from "react";
import { Button } from "@/components/ui/button";
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
              variant="fabItem"
              size="icon"
              className="animate-enter"
              onClick={() => {
                setOpen(false);
              }}
              aria-label="Do magic"
            >
              <Sparkles />
            </Button>
            <Button
              variant="fabItem"
              size="icon"
              className="animate-enter"
              onClick={() => {
                setOpen(false);
              }}
              aria-label="Open settings"
            >
              <Settings />
            </Button>
          </>
        )}
      </div>
      {/* Main FAB */}
      <Button
        variant="fab"
        size="fab"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="shadow-lg"
      >
        {open ? <X /> : <Plus />}
      </Button>
    </div>
  );
};
export default FabMenu;