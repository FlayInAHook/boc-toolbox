/*

this should be a simple card component width corners teh fade away once they go over the normal border

      |                | 
   ---+----------------+---   
      |                |
      |                |
      |                |
      |                |
   ---+----------------+---
      |                |
*/

import { Box, HTMLChakraProps } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from 'react';

type FadedCardProps = {
  children?: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
  overflowPercent?: number; // Percentage of card size to use for overflow
} & HTMLChakraProps<"div">;

const FadedCard: React.FC<FadedCardProps> = ({ 
  children, 
  overflowPercent = 100, // Default to 100% overflow
  borderColor = "oklch(0.371 0 0)",
  ...props 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });
    
    // Initial measurement
    setDimensions({
      width: card.offsetWidth,
      height: card.offsetHeight
    });
    
    // Start observing for size changes
    resizeObserver.observe(card);
    
    // Cleanup observer on unmount
    return () => resizeObserver.disconnect();
  }, []);
  
  // Calculate the overflow based on card dimensions and specified percentage
  const horizontalOverflow = `${-1 * dimensions.width * (overflowPercent / 100)}px`;
  const verticalOverflow = `${-1 * dimensions.height * (overflowPercent / 100)}px`;
  
  return (
    <Box
      position="relative"
      p={4}
      boxShadow="sm"
      ref={cardRef}
      {...props}
    >
      <Box
        position="absolute"
        left={horizontalOverflow}
        right={horizontalOverflow}
        top={0}
        height={"1px"}
        backgroundImage={`linear-gradient(to right, rgba(0, 0, 0, 0) 0%, ${borderColor} 50%, rgba(0, 0, 0, 0) 100%)`}
        zIndex={-10}
      />
      <Box
        position="absolute"
        top={verticalOverflow}
        bottom={verticalOverflow}
        left={0}
        width={"1px"}
        backgroundImage={`linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, ${borderColor} 50%, rgba(0, 0, 0, 0) 100%)`}
        zIndex={-10}
      />
      <Box
        position="absolute"
        right={horizontalOverflow}
        left={horizontalOverflow}
        bottom={0}
        height={"1px"}
        backgroundImage={`linear-gradient(to right, rgba(0, 0, 0, 0) 0%, ${borderColor} 50%, rgba(0, 0, 0, 0) 100%)`}
        zIndex={-10}
      />
      <Box
        position="absolute"
        bottom={verticalOverflow}
        top={verticalOverflow}
        right={0}
        width={"1px"}
        backgroundImage={`linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, ${borderColor} 50%, rgba(0, 0, 0, 0) 100%)`}
        zIndex={-10}
      />
      
      {children}
    </Box>
  );
};

export default FadedCard;
