import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card } from "@shopify/shop-minis-react";

export function VotePage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Which fit is better?
          </h2>
          <TransitionLink to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">Back</Button>
          </TransitionLink>
        </div>
        <div className="grid grid-cols-2 gap-4 [&_*]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_span]:!text-white">
          <Card className="p-4 rounded-2xl bg-gray-800 text-center text-white">Option A</Card>
          <Card className="p-4 rounded-2xl bg-gray-800 text-center text-white">Option B</Card>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full bg-[#1a1a1a] text-white">Vote A</Button>
          <Button className="w-full bg-[#1a1a1a] text-white">Vote B</Button>
        </div>
      </div>
    </div>
  );
}
