import React, { useState, useEffect } from "react";

// FabMenu Component
function FabMenu({ navigate }: { navigate: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: "Choose Fits", action: () => navigate("/vote") },
    { label: "Vote on Outfits", action: () => console.log("Vote clicked"), disabled: false },
  ];

  return (
    <div className="fab-container">
      <div className={`fab-menu ${isOpen ? 'open' : 'closed'}`}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`fab-menu-item`}
            onClick={item.disabled ? undefined : item.action}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="fab-menu-label">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div 
        className={`fab-main ${isOpen ? 'fab-open' : ''}`}
        onClick={toggleMenu}
      >
        <span className="fab-icon">+</span>
      </div>
    </div>
  );
}

export default function Landing({
  navigate = (path: string) => console.log(`Navigate to: ${path}`)
}: {
  navigate?: (path: string) => void;
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

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes fabItemSlideIn {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
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
        
        .particle-7 {
          width: 42px;
          height: 42px;
          top: 15%;
          left: 70%;
          background-image: url('https://purepng.com/public/uploads/large/purepng.com-black-jeansjeanspantsdenim-pantsdenim-jeansblack-jeansblack-pants-1421526576015wnxhg.png');
          animation: particleFloat3 24s ease-in-out infinite;
          animation-delay: -6s;
          opacity: 0.28;
        }
        
        .particle-8 {
          width: 48px;
          height: 48px;
          top: 35%;
          right: 8%;
          background-image: url('https://freepngimg.com/thumb/dress/25402-7-dress-transparent-background.png');
          animation: particleFloat1 26s ease-in-out infinite;
          animation-delay: -18s;
          opacity: 0.32;
        }
        
        .particle-9 {
          width: 38px;
          height: 38px;
          bottom: 25%;
          left: 25%;
          background-image: url('https://www.pngmart.com/files/16/Hoodie-PNG-Pic.png');
          animation: particleFloat4 21s ease-in-out infinite;
          animation-delay: -3s;
          opacity: 0.26;
        }
        
        .particle-10 {
          width: 52px;
          height: 52px;
          top: 55%;
          left: 18%;
          background-image: url('https://purepng.com/public/uploads/large/purepng.com-black-shoeshshoesblack-shoescasual-shoessports-shoes-1421526576394oqfj3.png');
          animation: particleFloat2 29s ease-in-out infinite;
          animation-delay: -20s;
          opacity: 0.3;
        }
        
        .particle-11 {
          width: 44px;
          height: 44px;
          top: 8%;
          right: 45%;
          background-image: url('https://www.pngarts.com/files/4/Skirt-PNG-Free-Download.png');
          animation: particleFloat3 23s ease-in-out infinite;
          animation-delay: -14s;
          opacity: 0.24;
        }
        
        .particle-12 {
          width: 36px;
          height: 36px;
          bottom: 40%;
          right: 35%;
          background-image: url('https://purepng.com/public/uploads/large/purepng.com-polo-shirtpolo-shirtshirtcollared-shirttennis-shirtgolf-shirt-1421526297963q3q7z.png');
          animation: particleFloat1 27s ease-in-out infinite;
          animation-delay: -7s;
          opacity: 0.22;
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
          position: relative;
          height: auto;
        }

        .typing-line {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          margin: 0;
          position: relative;
          color: white;
        }

        .typing-line-1 {
          animation: typing 2s steps(13, end);
          animation-delay: 0.5s;
          animation-fill-mode: both;
        }

        .typing-line-2 {
          animation: typing 1.2s steps(7, end);
          animation-delay: 3s;
          animation-fill-mode: both;
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

        /* FAB Menu Styles */
        .fab-container {
          position: relative;
          z-index: 1000;
          margin: 30px 0;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          justify-content: center;
        }

        .fab-main {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .fab-main::before {
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
        }

        .fab-main:hover::before {
          left: 100%;
        }

        .fab-main:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            0 0 30px rgba(255, 255, 255, 0.2);
        }

        .fab-icon {
          font-size: 24px;
          color: white;
          transition: transform 0.3s ease;
          z-index: 2;
          position: relative;
          font-weight: 300;
        }

        .fab-open .fab-icon {
          transform: rotate(45deg);
        }

        .fab-menu {
          position: relative;
          bottom: auto;
          right: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.9);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          margin-top: 20px;
          width: 100%;
          max-width: 350px;
          align-items: stretch;
          pointer-events: none;
        }

        .fab-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .fab-menu.closed {
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.9);
          pointer-events: none;
        }

        .fab-menu-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 24px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          white-space: nowrap;
          width: 100%;
          height: 60px;
          animation: fabItemSlideIn 0.4s ease-out;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .fab-menu-primary {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1) !important;
        }

        .fab-menu-primary::before {
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

        .fab-menu-disabled {
          background: linear-gradient(135deg, rgba(34, 34, 34, 0.8) 0%, rgba(20, 20, 20, 0.6) 100%) !important;
          color: rgba(255, 255, 255, 0.5) !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }

        .fab-menu-disabled .fab-menu-label {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .fab-menu.open .fab-menu-item {
          animation: fabItemSlideIn 0.4s ease-out forwards;
        }

        .fab-menu-item:hover:not(.fab-menu-disabled) {
          transform: translateY(-2px) scale(1.02);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .fab-menu-primary:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%) !important;
          box-shadow: 
            0 15px 50px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 0 40px rgba(255, 255, 255, 0.2) !important;
        }

        .fab-menu-icon {
          font-size: 20px;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
        }

        .fab-menu-label {
          font-size: 16px;
          font-weight: 700;
          color: white;
          letter-spacing: 1px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 2;
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

          .fab-container {
            margin: 20px 0;
          }

          .fab-menu-item {
            padding: 14px 20px;
            height: 56px;
          }

          .fab-menu-label {
            font-size: 15px;
          }

          .fab-main {
            width: 56px;
            height: 56px;
          }

          .fab-icon {
            font-size: 20px;
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
            src="https://i.pinimg.com/1200x/be/03/a7/be03a78695fb2b35f14a3379ff64af7b.jpg"
            alt="Fashion showcase"
            className="hero-image"
          />
          
          <div className="brand-tag">OUTFITTER</div>
          
          <h1 className="main-title">
            <span className="typing-line typing-line-1">VOTE THE BEST</span>
            <span className="typing-line typing-line-2">OUTFITS</span>
          </h1>
          
          {/* FAB Menu positioned below title */}
          <FabMenu navigate={navigate} />
        </div>
      </div>
    </>
  );
}