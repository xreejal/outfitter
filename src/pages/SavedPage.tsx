import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card } from "@shopify/shop-minis-react";

export function SavedPage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-[#E8DDB5]">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Saved</h2>
          <TransitionLink to="/">
            <Button variant="outline">Back</Button>
          </TransitionLink>
        </div>
        <Card className="p-4 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bookmarked Fit</p>
              <p className="text-xs text-[#2a2a2a]/70">Tap to view</p>
            </div>
            <Button>Add to cart</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
