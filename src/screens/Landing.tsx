import React, { useState, useEffect } from "react";
import { Button } from "@shopify/shop-minis-react";

export default function Landing({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes liquidShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.15);
          }
          50% {
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.25);
          }
        }
        
        @keyframes morphBackground {
          0%, 100% {
            border-radius: 50px;
          }
          25% {
            border-radius: 60px;
          }
          50% {
            border-radius: 45px;
          }
          75% {
            border-radius: 55px;
          }
        }
        
        @keyframes heroImageFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes particleFloat1 {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
        
        @keyframes particleFloat2 {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          50% {
            transform: translate(-40px, -25px) rotate(180deg);
          }
        }
        
        @keyframes particleFloat3 {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(25px, 35px) rotate(90deg);
          }
          75% {
            transform: translate(-30px, -20px) rotate(270deg);
          }
        }
        
        @keyframes particleFloat4 {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          40% {
            transform: translate(-35px, 15px) rotate(144deg);
          }
          80% {
            transform: translate(20px, -40px) rotate(288deg);
          }
        }
        
        @keyframes orbGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
        
        .hero-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #000000 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        
        .particle {
          position: absolute;
          border-radius: 15px;
          background-size: cover;
          background-position: center;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .particle-1 {
          width: 60px;
          height: 60px;
          top: 10%;
          left: 15%;
          background-image: url('https://png.pngtree.com/png-vector/20250530/ourmid/pngtree-sage-green-wide-leg-pants-flat-lay-cutout-ultra-high-resolution-png-image_16412454.png');
          animation: particleFloat1 20s ease-in-out infinite;
          opacity: 0.4;
        }
        
        .particle-2 {
          width: 45px;
          height: 45px;
          top: 25%;
          right: 20%;
          background-image: url('https://cdn.shopify.com/s/files/1/0553/3469/9198/products/s_4s__BOXY-FRONT.png?v=1679626573');
          animation: particleFloat2 25s ease-in-out infinite;
          animation-delay: -5s;
          opacity: 0.3;
        }
        
        .particle-3 {
          width: 50px;
          height: 50px;
          bottom: 30%;
          left: 10%;
          background-image: url('https://hatroom.eu/images/zoom/60292734.738_1.png');
          animation: particleFloat3 18s ease-in-out infinite;
          animation-delay: -10s;
          opacity: 0.35;
        }
        
        .particle-4 {
          width: 40px;
          height: 40px;
          top: 60%;
          right: 15%;
          background-image: url('https://purepng.com/public/uploads/thumbnail//white-tshirt-mxy.png');
          animation: particleFloat4 22s ease-in-out infinite;
          animation-delay: -8s;
          opacity: 0.25;
        }
        
        .particle-5 {
          width: 35px;
          height: 35px;
          top: 40%;
          left: 5%;
          background-image: url('https://sneakernerds.com/cdn/shop/products/jordan-1-retro-high-og-lost-and-found-1-1000.png?v=1670690022');
          animation: particleFloat1 30s ease-in-out infinite;
          animation-delay: -15s;
          opacity: 0.2;
        }
        
        .particle-6 {
          width: 55px;
          height: 55px;
          bottom: 15%;
          right: 25%;
          background-image: url('https://www.pngarts.com/files/2/Denim-Jacket-Download-PNG-Image.png');
          animation: particleFloat2 28s ease-in-out infinite;
          animation-delay: -12s;
          opacity: 0.3;
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          animation: orbGlow 4s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 20px;
          height: 20px;
          top: 20%;
          left: 80%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 15px;
          height: 15px;
          top: 70%;
          left: 10%;
          animation-delay: -2s;
        }
        
        .orb-3 {
          width: 25px;
          height: 25px;
          top: 50%;
          right: 5%;
          animation-delay: -1s;
        }
        
        .orb-4 {
          width: 12px;
          height: 12px;
          bottom: 20%;
          left: 70%;
          animation-delay: -3s;
        }
        
        .content-wrapper {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          max-width: 600px;
          width: 100%;
          animation: fadeInUp 1s ease-out;
        }
        
        .hero-image {
          width: 100%;
          max-width: 400px;
          height: 300px;
          object-fit: cover;
          border-radius: 30px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.1);
          animation: heroImageFloat 6s ease-in-out infinite;
        }
        
        .brand-tag {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 15px;
          text-align: center;
        }
        
        .main-title {
          font-size: clamp(2.5rem, 8vw, 3.5rem);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -2px;
          margin-bottom: 30px;
          color: white;
          text-align: center;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          background: linear-gradient(45deg, #ffffff, #cccccc);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .buttons-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 350px;
        }
        
        .liquid-glass-primary {
          position: relative !important;
          width: 100% !important;
          height: 60px !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 50px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          color: white !important;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1) !important;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
          overflow: hidden !important;
          animation: morphBackground 8s ease-in-out infinite, glowPulse 4s ease-in-out infinite !important;
          cursor: pointer !important;
        }
        
        .liquid-glass-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.8s;
          animation: liquidShimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        
        .liquid-glass-primary:hover {
          transform: translateY(-2px) scale(1.02) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
          box-shadow: 
            0 15px 50px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 0 40px rgba(255, 255, 255, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        
        .liquid-glass-primary:active {
          transform: translateY(0) scale(0.98) !important;
        }
        
        .liquid-glass-secondary {
          position: relative !important;
          width: 100% !important;
          height: 60px !important;
          background: linear-gradient(135deg, rgba(34, 34, 34, 0.8) 0%, rgba(20, 20, 20, 0.6) 100%) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 50px !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          color: rgba(255, 255, 255, 0.5) !important;
          box-shadow: 
            0 8px 30px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3) !important;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
          overflow: hidden !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          animation: morphBackground 10s ease-in-out infinite reverse !important;
        }
        
        .button-text {
          position: relative;
          z-index: 2;
          letter-spacing: 1px;
        }
        
        @media (max-width: 768px) {
          .hero-image {
            height: 250px;
            margin-bottom: 25px;
          }
          
          .main-title {
            font-size: clamp(2rem, 10vw, 3rem);
            margin-bottom: 25px;
          }
          
          .buttons-container {
            max-width: 300px;
          }
          
          .liquid-glass-primary,
          .liquid-glass-secondary {
            height: 56px !important;
            font-size: 16px !important;
          }
          
          .particle {
            transform: scale(0.7);
          }
        }
      `}</style>

      <div className="hero-container">
        {/* CSS-only particle system */}
        <div className="particles-container">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
          
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
        </div>
        
        <div className="content-wrapper">
          <img
            src="https://sdmntprwestus.oaiusercontent.com/files/00000000-973c-6230-805d-7575ab7eab4d/raw?se=2025-08-10T04%3A26%3A25Z&sp=r&sv=2024-08-04&sr=b&scid=0f832a7c-cde8-5b75-949b-4a214959c1e0&skoid=b64a43d9-3512-45c2-98b4-dea55d094240&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-08-09T08%3A11%3A30Z&ske=2025-08-10T08%3A11%3A30Z&sks=b&skv=2024-08-04&sig=T8ISQMaa9y4PXWOfhLFrTySSC4bvD/o7E4fubSnGB6Q%3D"
            alt="Fashion showcase"
            className="hero-image"
          />
          
          <div className="brand-tag">OUTFITTER</div>
          
          <h1 className="main-title">
            VOTE THE BEST<br />
            OUTFITS
          </h1>
          
          <div className="buttons-container">
            <Button
              variant="default"
              className="liquid-glass-primary"
              onClick={() => navigate("/create")}
            >
              <span className="button-text">Choose Fits</span>
            </Button>
            
            <Button
              variant="outline"
              className="liquid-glass-primary"
              disabled
            >
              <span className="button-text">Vote on Outfits</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}