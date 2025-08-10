import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card, Separator } from "@shopify/shop-minis-react";

export function CreatePage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Create Battle
          </h2>
          <TransitionLink to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">Back</Button>
          </TransitionLink>
        </div>
        <Card className="p-4 rounded-2xl glass-card border border-white/20">
          <p className="text-sm text-white/80 mb-2">Option A</p>
          <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-white/20">Add Item</Button>
        </Card>
        <Card className="p-4 rounded-2xl glass-card border border-white/20">
          <p className="text-sm text-white/80 mb-2">Option B</p>
          <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-white/20">Add Item</Button>
        </Card>
        <Separator className="bg-white/20" />
        <Button className="w-full bg-[#1a1a1a] text-white">Publish</Button>
      </div>
    </div>
  );
}
