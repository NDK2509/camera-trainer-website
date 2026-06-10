import React from 'react';

export type CompositionType = 'thirds' | 'phi' | 'spiral' | 'leading' | 'symmetry' | 'triangles' | 'none';

interface CompositionOverlaysProps {
  type: CompositionType;
  spiralRotation: number; // 0, 90, 180, 270
}

export const CompositionOverlays: React.FC<CompositionOverlaysProps> = ({ type, spiralRotation }) => {
  if (type === 'none') return null;

  // Render SVG based on chosen type
  switch (type) {
    case 'thirds':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Rule of Thirds Grid */}
          <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Golden Points (intersections) */}
          <circle cx="33.33%" cy="33.33%" r="4" fill="rgba(20, 184, 166, 0.8)" className="animate-pulse" />
          <circle cx="66.66%" cy="33.33%" r="4" fill="rgba(20, 184, 166, 0.8)" className="animate-pulse" />
          <circle cx="33.33%" cy="66.66%" r="4" fill="rgba(20, 184, 166, 0.8)" className="animate-pulse" />
          <circle cx="66.66%" cy="66.66%" r="4" fill="rgba(20, 184, 166, 0.8)" className="animate-pulse" />
        </svg>
      );

    case 'phi':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Phi Grid (38.2% and 61.8%) */}
          <line x1="38.2%" y1="0" x2="38.2%" y2="100%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="61.8%" y1="0" x2="61.8%" y2="100%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="0" y1="38.2%" x2="100%" y2="38.2%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="0" y1="61.8%" x2="100%" y2="61.8%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Golden Ratio intersection indicator circles */}
          <circle cx="38.2%" cy="38.2%" r="5" fill="none" stroke="rgba(20, 184, 166, 0.7)" strokeWidth="1" />
          <circle cx="61.8%" cy="38.2%" r="5" fill="none" stroke="rgba(20, 184, 166, 0.7)" strokeWidth="1" />
          <circle cx="38.2%" cy="61.8%" r="5" fill="none" stroke="rgba(20, 184, 166, 0.7)" strokeWidth="1" />
          <circle cx="61.8%" cy="61.8%" r="5" fill="none" stroke="rgba(20, 184, 166, 0.7)" strokeWidth="1" />
        </svg>
      );

    case 'spiral':
      // Rotate and flip based on spiralRotation state (0, 90, 180, 270)
      const rotationStyle = {
        transform: `rotate(${spiralRotation}deg)`,
        transformOrigin: '50% 50%',
        transition: 'transform 0.3s ease-in-out',
      };
      return (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 1000 618" 
          preserveAspectRatio="none"
          style={rotationStyle}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Drawing the golden spiral using SVG path approximating Fibonacci arcs */}
          <path 
            d="M 0 618 
               A 618 618 0 0 1 618 0 
               A 382 382 0 0 1 1000 382 
               A 236 236 0 0 1 764 618 
               A 146 146 0 0 1 618 472 
               A 90 90 0 0 1 708 382 
               A 56 56 0 0 1 764 438 
               A 34 34 0 0 1 730 472
               A 21 21 0 0 1 709 451" 
            fill="none" 
            stroke="rgba(20, 184, 166, 0.7)" 
            strokeWidth="2.5" 
          />
          {/* Assist lines that build the golden ratio boxes */}
          <line x1="618" y1="0" x2="618" y2="618" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="618" y1="382" x2="1000" y2="382" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="764" y1="382" x2="764" y2="618" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="618" y1="472" x2="764" y2="472" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        </svg>
      );

    case 'leading':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Perspective leading lines from corners to center */}
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Horizontal and vertical center lines */}
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

          {/* Central guidance box */}
          <rect x="25%" y="25%" width="50%" height="50%" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'symmetry':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Centered crosshairs */}
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="1.5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="1.5" />
          
          {/* Concentric helper circles */}
          <circle cx="50%" cy="50%" r="30" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
          <circle cx="50%" cy="50%" r="60" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        </svg>
      );

    case 'triangles':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Golden Triangle guides */}
          {/* Major diagonal from top-left to bottom-right */}
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
          
          {/* Perpendiculars from other corners */}
          {/* Note: In a true golden triangle, they meet the diagonal at right angles.
              For responsiveness, we can project to 61.8% along the path or simply draw standard corner diagonals. */}
          <line x1="100%" y1="0" x2="38.2%" y2="38.2%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="0" y1="100%" x2="61.8%" y2="61.8%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Highlight intersection points */}
          <circle cx="38.2%" cy="38.2%" r="4" fill="rgba(20, 184, 166, 0.8)" />
          <circle cx="61.8%" cy="61.8%" r="4" fill="rgba(20, 184, 166, 0.8)" />
        </svg>
      );

    default:
      return null;
  }
};
