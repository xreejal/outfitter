import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card } from "@shopify/shop-minis-react";

export function VotePage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-[#B2C9AB]">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">
            Which fit is better?
          </h2>
          <TransitionLink to="/">
            <Button variant="outline">Back</Button>
          </TransitionLink>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 rounded-2xl bg-white text-center">Option A</Card>
          <Card className="p-4 rounded-2xl bg-white text-center">Option B</Card>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full bg-[#1a1a1a] text-white">Vote A</Button>
          <Button className="w-full bg-[#1a1a1a] text-white">Vote B</Button>
        </div>
      </div>
    </div>
  );
}
