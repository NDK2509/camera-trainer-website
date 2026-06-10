import React, { useState, useEffect, useRef } from 'react';
import { CompositionOverlays } from './CompositionOverlays';
import type { CompositionType } from './CompositionOverlays';
import { Move } from 'lucide-react';

interface ViewfinderProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  composition: CompositionType;
  spiralRotation: number;
  aspectRatio: string; // "16:9" | "4:3" | "3:2" | "1:1"
  orientation: 'horizontal' | 'vertical'; // 'horizontal' | 'vertical'
  // Viewfinder position as percentage of image container: 0 to 100
  box: { x: number; y: number; width: number; height: number };
  setBox: React.Dispatch<React.SetStateAction<{ x: number; y: number; width: number; height: number }>>;
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  imageRef,
  composition,
  spiralRotation,
  aspectRatio,
  orientation,
  box,
  setBox,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxWidth: 0, boxHeight: 0 });

  // Calculate target aspect ratio numerical value
  const getTargetRatio = () => {
    const [w, h] = aspectRatio.split(':').map(Number);
    return orientation === 'horizontal' ? w / h : h / w;
  };

  // Adjust box dimensions whenever aspect ratio or orientation changes
  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;
    const imgWidth = imageRef.current.clientWidth;
    const imgHeight = imageRef.current.clientHeight;
    if (imgWidth === 0 || imgHeight === 0) return;

    const targetRatio = getTargetRatio();
    const containerRatio = imgWidth / imgHeight;

    // We want the default viewfinder to cover roughly 60% of the image
    let newWidthPercent = 60;
    // convert target width percent to actual height percent using container ratios
    let newHeightPercent = (newWidthPercent * containerRatio) / targetRatio;

    // Clamp if height exceeds 90%
    if (newHeightPercent > 90) {
      newHeightPercent = 90;
      newWidthPercent = (newHeightPercent * targetRatio) / containerRatio;
    }
    // Clamp if width exceeds 90%
    if (newWidthPercent > 90) {
      newWidthPercent = 90;
      newHeightPercent = (newWidthPercent * containerRatio) / targetRatio;
    }

    setBox({
      x: (100 - newWidthPercent) / 2,
      y: (100 - newHeightPercent) / 2,
      width: newWidthPercent,
      height: newHeightPercent,
    });
  }, [aspectRatio, orientation]);

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: box.x,
      boxY: box.y,
    };
  };

  // Handle Resize Start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(handle);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: box.x,
      boxY: box.y,
      boxWidth: box.width,
      boxHeight: box.height,
    };
  };

  // Global mouse move and mouse up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return;
      const imgWidth = imageRef.current.clientWidth;
      const imgHeight = imageRef.current.clientHeight;

      if (isDragging) {
        const deltaX = ((e.clientX - dragStart.current.x) / imgWidth) * 100;
        const deltaY = ((e.clientY - dragStart.current.y) / imgHeight) * 100;

        let newX = dragStart.current.boxX + deltaX;
        let newY = dragStart.current.boxY + deltaY;

        // Constraint checking (stay within container boundaries)
        newX = Math.max(0, Math.min(100 - box.width, newX));
        newY = Math.max(0, Math.min(100 - box.height, newY));

        setBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        const deltaX = ((e.clientX - resizeStart.current.x) / imgWidth) * 100;
        const targetRatio = getTargetRatio();
        const containerRatio = imgWidth / imgHeight;

        let newWidth = resizeStart.current.boxWidth;
        let newHeight = resizeStart.current.boxHeight;
        let newX = resizeStart.current.boxX;
        let newY = resizeStart.current.boxY;

        if (isResizing === 'br') {
          newWidth = Math.max(15, resizeStart.current.boxWidth + deltaX);
          newHeight = (newWidth * containerRatio) / targetRatio;

          // Clamping to boundaries
          if (newX + newWidth > 100) {
            newWidth = 100 - newX;
            newHeight = (newWidth * containerRatio) / targetRatio;
          }
          if (newY + newHeight > 100) {
            newHeight = 100 - newY;
            newWidth = (newHeight * targetRatio) / containerRatio;
          }
        } else if (isResizing === 'tl') {
          newWidth = Math.max(15, resizeStart.current.boxWidth - deltaX);
          newHeight = (newWidth * containerRatio) / targetRatio;

          // Adjust top-left position
          newX = resizeStart.current.boxX + (resizeStart.current.boxWidth - newWidth);
          newY = resizeStart.current.boxY + (resizeStart.current.boxHeight - newHeight);

          if (newX < 0) {
            newWidth = resizeStart.current.boxWidth + resizeStart.current.boxX;
            newHeight = (newWidth * containerRatio) / targetRatio;
            newX = 0;
            newY = resizeStart.current.boxY + (resizeStart.current.boxHeight - newHeight);
          }
          if (newY < 0) {
            newHeight = resizeStart.current.boxHeight + resizeStart.current.boxY;
            newWidth = (newHeight * targetRatio) / containerRatio;
            newY = 0;
            newX = resizeStart.current.boxX + (resizeStart.current.boxWidth - newWidth);
          }
        } else if (isResizing === 'tr') {
          newWidth = Math.max(15, resizeStart.current.boxWidth + deltaX);
          newHeight = (newWidth * containerRatio) / targetRatio;
          const bottomEdge = resizeStart.current.boxY + resizeStart.current.boxHeight;
          newY = bottomEdge - newHeight;

          if (newX + newWidth > 100) {
            newWidth = 100 - newX;
            newHeight = (newWidth * containerRatio) / targetRatio;
            newY = bottomEdge - newHeight;
          }
          if (newY < 0) {
            newHeight = bottomEdge;
            newWidth = (newHeight * targetRatio) / containerRatio;
            newY = 0;
            if (newX + newWidth > 100) {
              newWidth = 100 - newX;
              newHeight = (newWidth * containerRatio) / targetRatio;
              newY = bottomEdge - newHeight;
            }
          }
        } else if (isResizing === 'bl') {
          newWidth = Math.max(15, resizeStart.current.boxWidth - deltaX);
          newHeight = (newWidth * containerRatio) / targetRatio;
          const rightEdge = resizeStart.current.boxX + resizeStart.current.boxWidth;
          newX = rightEdge - newWidth;

          if (newX < 0) {
            newWidth = rightEdge;
            newHeight = (newWidth * containerRatio) / targetRatio;
            newX = 0;
          }
          if (newY + newHeight > 100) {
            newHeight = 100 - newY;
            newWidth = (newHeight * targetRatio) / containerRatio;
            newX = rightEdge - newWidth;
            if (newX < 0) {
              newWidth = rightEdge;
              newHeight = (newWidth * containerRatio) / targetRatio;
              newX = 0;
            }
          }
        }

        setBox({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, box, aspectRatio, orientation]);

  // Adjust coordinates for rendering style
  const boxStyle = {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
  };

  return (
    <div className="absolute -inset-[1px] select-none overflow-hidden rounded-lg">
      {/* Dimmed background overlay outside of viewfinder box */}
      <div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% ${box.y}%, 
            ${box.x}% ${box.y}%, 
            ${box.x}% ${box.y + box.height}%, 
            ${box.x + box.width}% ${box.y + box.height}%, 
            ${box.x + box.width}% ${box.y}%, 
            0% ${box.y}%
          )`
        }}
      />

      {/* The Viewfinder Box */}
      <div
        ref={containerRef}
        style={boxStyle}
        className={`absolute border-2 border-teal-400 shadow-[0_0_0_1px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(0,0,0,0.5)] cursor-move transition-shadow ${isDragging ? 'shadow-2xl border-teal-300' : 'hover:border-teal-300'
          }`}
        onMouseDown={handleDragStart}
      >
        {/* Render Vector Overlays inside */}
        <CompositionOverlays type={composition} spiralRotation={spiralRotation} />

        {/* Drag Helper Center Icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-40 transition-opacity bg-neutral-900 p-1.5 rounded-full pointer-events-none text-white">
          <Move size={16} />
        </div>

        {/* Corner Resize Handles */}
        {/* Top-Left */}
        <div
          className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-teal-400 cursor-nwse-resize rounded-tl-sm active:border-teal-200 z-10"
          onMouseDown={(e) => handleResizeStart(e, 'tl')}
        />
        {/* Top-Right */}
        <div
          className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-teal-400 cursor-nesw-resize rounded-tr-sm active:border-teal-200 z-10"
          onMouseDown={(e) => handleResizeStart(e, 'tr')}
        />
        {/* Bottom-Left */}
        <div
          className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-teal-400 cursor-nesw-resize rounded-bl-sm active:border-teal-200 z-10"
          onMouseDown={(e) => handleResizeStart(e, 'bl')}
        />
        {/* Bottom-Right */}
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-teal-400 cursor-nwse-resize rounded-br-sm active:border-teal-200 z-10"
          onMouseDown={(e) => handleResizeStart(e, 'br')}
        />

        {/* Subtitle indicator of composition active */}
        <div className="absolute bottom-2 left-3 bg-neutral-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-neutral-300 border border-neutral-800 pointer-events-none capitalize">
          {composition === 'none' ? 'No Grid' : composition.replace('-', ' ')}
        </div>
      </div>
    </div>
  );
};
