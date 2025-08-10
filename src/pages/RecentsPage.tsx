import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card } from "@shopify/shop-minis-react";

export function RecentsPage() {
  return (
    <div className="min-h-screen px-4 pt-10 pb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recents</h2>
          <TransitionLink to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">Back</Button>
          </TransitionLink>
        </div>
        <Card className="p-4 rounded-2xl glass-card border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Sample Poll</p>
              <p className="text-xs text-white/70">A: 62% · B: 38%</p>
            </div>
            <Button className="bg-gray-700 text-white border border-white/20 hover:bg-gray-600">View</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
