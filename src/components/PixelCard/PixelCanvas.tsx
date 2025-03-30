import React, { useEffect, useRef, useState } from 'react';
import { Pixel } from './Pixel';

export interface PixelCanvasProps {
  colors?: string;
  gap?: number;
  speed?: number;
  noFocus?: boolean;
  className?: string;
  forceAppear?: boolean; // New prop to control animation from parent
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({ 
  colors = "#f8fafc, #f1f5f9, #cbd5e1",
  gap = 5,
  speed = 35,
  noFocus = false,
  className,
  forceAppear // Accept the prop
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  const timeIntervalRef = useRef(1000 / 60);
  const timePreviousRef = useRef(performance.now());
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Track previous forceAppear state to detect changes
  const prevForceAppearRef = useRef(forceAppear);

  const getColorArray = (): string[] => {
    return colors.split(',').map(color => color.trim());
  };

  const getGapValue = (): number => {
    const min = 4;
    const max = 50;
    const value = gap;

    if (value <= min) {
      return min;
    } else if (value >= max) {
      return max;
    } else {
      return value;
    }
  };

  const getSpeedValue = (): number => {
    const min = 0;
    const max = 100;
    const throttle = 0.001;
    const value = speed;

    if (value <= min || reducedMotion) {
      return min;
    } else if (value >= max) {
      return max * throttle;
    } else {
      return value * throttle;
    }
  };

  const getDistanceToCanvasCenter = (x: number, y: number, canvas: HTMLCanvasElement): number => {
    const dx = x - canvas.width / 2;
    const dy = y - canvas.height / 2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const createPixels = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Pixel[] => {
    const pixels: Pixel[] = [];
    const colorArray = getColorArray();
    const gapValue = getGapValue();
    const speedValue = getSpeedValue();

    for (let x = 0; x < canvas.width; x += gapValue) {
      for (let y = 0; y < canvas.height; y += gapValue) {
        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        const delay = reducedMotion ? 0 : getDistanceToCanvasCenter(x, y, canvas);
        pixels.push(new Pixel(canvas, ctx, x, y, color, speedValue, delay));
      }
    }
    
    return pixels;
  };

  const animate = (fnName: 'appear' | 'disappear') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animateFn = () => {
      const timeNow = performance.now();
      const timePassed = timeNow - timePreviousRef.current;

      if (timePassed < timeIntervalRef.current) {
        animationRef.current = requestAnimationFrame(animateFn);
        return;
      }

      timePreviousRef.current = timeNow - (timePassed % timeIntervalRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < pixelsRef.current.length; i++) {
        pixelsRef.current[i][fnName]();
      }

      if (pixelsRef.current.every((pixel) => pixel.isIdle)) {
        cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(animateFn);
      }
    };

    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateFn);
  };

  // Initialize pixels when component mounts or canvas size changes
  const initPixels = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    pixelsRef.current = createPixels(canvas, ctx);
  };

  // Watch for forceAppear changes to trigger animations
  useEffect(() => {
    if (forceAppear !== prevForceAppearRef.current) {
      prevForceAppearRef.current = forceAppear;
      if (forceAppear) {
        animate('appear');
      } else {
        animate('disappear');
      }
    }
  }, [forceAppear]);

  // Handle events - We'll still keep these for direct interaction with the canvas
  const handleMouseEnter = () => {
    if (!forceAppear) { // Only handle if not controlled by parent
      animate('appear');
    }
  };

  const handleMouseLeave = () => {
    if (!forceAppear) { // Only handle if not controlled by parent
      animate('disappear');
    }
  };

  const handleFocusIn = (e: React.FocusEvent) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    if (!forceAppear) { // Only handle if not controlled by parent
      animate('appear');
    }
  };

  const handleFocusOut = (e: React.FocusEvent) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    if (!forceAppear) { // Only handle if not controlled by parent
      animate('disappear');
    }
  };

  // Setup resize observer and event listeners
  useEffect(() => {
    const checkReducedMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    
    checkReducedMotion();
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => checkReducedMotion();
    
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      initPixels();
    });
    
    resizeObserver.observe(container);
    initPixels();

    // Only add direct mouse event handlers if not controlled by parent
    if (forceAppear === undefined) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      if (!noFocus) {
        container.addEventListener('focusin', handleFocusIn as unknown as EventListener);
        container.addEventListener('focusout', handleFocusOut as unknown as EventListener);
      }
    }

    return () => {
      resizeObserver.disconnect();
      
      if (forceAppear === undefined) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);

        if (!noFocus) {
          container.removeEventListener('focusin', handleFocusIn as unknown as EventListener);
          container.removeEventListener('focusout', handleFocusOut as unknown as EventListener);
        }
      }
    };
  }, [noFocus, forceAppear]);

  return (
    <div ref={containerRef} className={className} style={{ display: 'grid', inlineSize: '100%', blockSize: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
