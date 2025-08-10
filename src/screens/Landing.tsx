import React, { useState, useEffect } from "react";
import { Clock, Bookmark } from "lucide-react";

// Corner Item Component
function CornerItem({
  label,
  path,
  icon: Icon,
  position,
  navigate,
}: {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  position: string;
  navigate: (path: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`corner-item corner-${position}`}
      onClick={() => navigate(path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="corner-icon-container">
        <Icon className="corner-icon" size={20} />
      </div>
      <span className={`corner-label ${isHovered ? 'visible' : ''}`}>
        {label}
      </span>
    </div>
  );
}

// FabMenu Component
function FabMenu({ navigate }: { navigate: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: "Choose Fits", action: () => navigate("/create") },
    { label: "Vote on Outfits", action: () => navigate("/vote"), disabled: false },
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
  navigate = (path: any) => console.log(`Navigate to: ${path}`)
}) {

  return (
    <div className="hero-container">
      <CornerItem 
        label="recents" 
        path="/recents" 
        icon={Clock} 
        position="left"
        navigate={navigate}
      />
      <CornerItem 
        label="saved" 
        path="/saved" 
        icon={Bookmark} 
        position="right"
        navigate={navigate}
      />

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
  );
}