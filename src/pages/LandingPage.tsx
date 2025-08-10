import { TransitionLink } from "@shopify/shop-minis-react";
import { Button, Card } from "@shopify/shop-minis-react";
import { ThreeBackground } from "../components/ThreeBackground";
import { AnimatedCard } from "../components/AnimatedCard";

export function LandingPage() {
  return (
    <div className="relative bg-[#fafafa] min-h-screen overflow-hidden">
      <ThreeBackground />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40 pointer-events-none" />
      
      <div className="z-10 relative mx-auto px-6 pt-16 pb-8 max-w-md">
        {/* Header Section */}
        <div className="opacity-0 mb-12 text-center animate-[fadeIn_0.8s_ease-out_forwards]">
          <h1 
            className="mb-4 font-bold text-[#1a1a1a] text-4xl tracking-tight"
            style={{ fontFamily: 'Helvetica Bold, Helvetica, Arial, sans-serif' }}
          >
            Outfit Fit Battler
          </h1>
          <p 
            className="mx-auto max-w-sm text-[#666] text-lg leading-relaxed"
            style={{ fontFamily: 'Helvetica Light, Helvetica, Arial, sans-serif' }}
          >
            Create, vote, and discover the best fashion combinations
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="space-y-6 mb-8">
          <AnimatedCard
            title="Create Battle"
            description="Build head-to-head fit competitions and share your style"
            buttonText="Start Creating"
            to="/create"
            bgColor="#92B6B1"
            textColor="#ffffff"
            buttonVariant="secondary"
            delay={200}
          />
          
          <AnimatedCard
            title="Vote & Discover"
            description="Participate in polls and discover trending styles"
            buttonText="Start Voting"
            to="/vote"
            bgColor="#B2C9AB"
            textColor="#1a1a1a"
            buttonVariant="default"
            delay={400}
          />
        </div>

        {/* Secondary Actions Grid */}
        <div className="gap-4 grid grid-cols-2">
          <Card className="group bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm p-4 border border-white/20 rounded-2xl transition-all duration-300">
            <div className="text-center">
              <div className="flex justify-center items-center bg-[#92B6B1]/20 mx-auto mb-3 rounded-full w-12 h-12 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 
                className="mb-1 font-bold text-[#1a1a1a] text-sm"
                style={{ fontFamily: 'Helvetica Bold, Helvetica, Arial, sans-serif' }}
              >
                Recents
              </h3>
              <p 
                className="mb-3 text-[#666] text-xs"
                style={{ fontFamily: 'Helvetica Light, Helvetica, Arial, sans-serif' }}
              >
                Your polls & results
              </p>
              <TransitionLink to="/recents">
                <Button 
                  variant="outline" 
                  className="w-full h-8 text-xs"
                >
                  View
                </Button>
              </TransitionLink>
            </div>
          </Card>

          <Card className="group bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm p-4 border border-white/20 rounded-2xl transition-all duration-300">
            <div className="text-center">
              <div className="flex justify-center items-center bg-[#B2C9AB]/20 mx-auto mb-3 rounded-full w-12 h-12 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 
                className="mb-1 font-bold text-[#1a1a1a] text-sm"
                style={{ fontFamily: 'Helvetica Bold, Helvetica, Arial, sans-serif' }}
              >
                Saved
              </h3>
              <p 
                className="mb-3 text-[#666] text-xs"
                style={{ fontFamily: 'Helvetica Light, Helvetica, Arial, sans-serif' }}
              >
                Bookmarked fits
              </p>
              <TransitionLink to="/saved">
                <Button 
                  variant="outline" 
                  className="w-full h-8 text-xs"
                >
                  View
                </Button>
              </TransitionLink>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p 
            className="text-[#999] text-xs"
            style={{ fontFamily: 'Helvetica Light, Helvetica, Arial, sans-serif' }}
          >
            Powered by Shopify Shop Minis
          </p>
        </div>
      </div>
    </div>
  );
}
