import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card } from "@shopify/shop-minis-react";

export function SavedPage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Saved</h2>
          <TransitionLink to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">Back</Button>
          </TransitionLink>
        </div>
        <Card className="p-4 rounded-2xl glass-card border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Bookmarked Fit</p>
              <p className="text-xs text-white/70">Tap to view</p>
            </div>
            <Button className="bg-gray-700 text-white border border-white/20 hover:bg-gray-600">Add to cart</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
