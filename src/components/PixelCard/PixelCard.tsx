import React, { useState } from 'react';
import { PixelCanvas, PixelCanvasProps } from './PixelCanvas';
import './PixelCard.css';

export interface PixelCardProps {
  icon: React.ReactNode;
  hoverIcon?: React.ReactNode;
  extraElement?: React.ReactNode;
  activeColor?: string;
  pixelCanvasProps?: PixelCanvasProps;
  className?: string;
  onClick?: () => void;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  icon,
  hoverIcon,
  extraElement,
  activeColor,
  pixelCanvasProps,
  className,  
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className={`card ${className || ''}`} 
      style={activeColor ? { '--active-color': activeColor } as React.CSSProperties : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <PixelCanvas {...pixelCanvasProps} forceAppear={isHovered} />
      <div className="icon-container">
        {hoverIcon ? (
          <>
            <div className="icon-default">{icon}</div>
            <div className="icon-hover">{hoverIcon}</div>
          </>
        ) : (
          <div className="icon-single">{icon}</div>
        )}
      </div>
      {extraElement ?? null}
    </div>
  );
};