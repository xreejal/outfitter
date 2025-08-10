import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card, Separator } from "@shopify/shop-minis-react";

export function CreatePage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-[#E8DDB5]">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">
            Create Battle
          </h2>
          <TransitionLink to="/">
            <Button variant="outline">Back</Button>
          </TransitionLink>
        </div>
        <Card className="p-4 rounded-2xl bg-white">
          <p className="text-sm text-[#2a2a2a] mb-2">Option A</p>
          <Button className="w-full bg-[#92B6B1] text-white">Add Item</Button>
        </Card>
        <Card className="p-4 rounded-2xl bg-white">
          <p className="text-sm text-[#2a2a2a] mb-2">Option B</p>
          <Button className="w-full bg-[#92B6B1] text-white">Add Item</Button>
        </Card>
        <Separator />
        <Button className="w-full bg-[#1a1a1a] text-white">Publish</Button>
      </div>
    </div>
  );
}
