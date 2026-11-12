import React from 'react';
import {
  CharacterDirection,
  PlacedAppTerminal,
  StudioDecorProp,
} from '../utils/pixelStudioWorld';

/**
 * Controllable Indie Dev Player Sprite (4-direction + 2-frame stride)
 */
export const IndieDevPlayerSprite: React.FC<{
  direction: CharacterDirection;
  isMoving: boolean;
  walkFrame: 0 | 1;
}> = ({ direction, isMoving, walkFrame }) => {
  const leftLegY = isMoving && walkFrame === 0 ? 12 : 13;
  const rightLegY = isMoving && walkFrame === 1 ? 12 : 13;
  const bobOffset = isMoving ? (walkFrame === 0 ? -1 : 0) : 0;

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className="w-10 h-10 pixelated select-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.7)]"
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <rect x="3" y="14" width="10" height="2" fill="rgba(0,0,0,0.5)" />

      <g transform={`translate(0, ${bobOffset})`}>
        {/* Hair & Beanie/Headphones Top */}
        <rect x="5" y="1" width="6" height="2" fill="#92400e" />
        <rect x="4" y="2" width="8" height="2" fill="#b45309" />
        {/* Headphone band */}
        <rect x="4" y="1" width="8" height="1" fill="#38bdf8" />

        {/* Head / Face */}
        {direction === 'up' ? (
          <>
            <rect x="4" y="3" width="8" height="5" fill="#92400e" />
            <rect x="3" y="4" width="1" height="3" fill="#0284c7" />
            <rect x="12" y="4" width="1" height="3" fill="#0284c7" />
          </>
        ) : direction === 'left' ? (
          <>
            <rect x="4" y="4" width="7" height="4" fill="#fed7aa" />
            <rect x="9" y="3" width="3" height="5" fill="#92400e" />
            <rect x="5" y="5" width="2" height="2" fill="#0f172a" />
            <rect x="8" y="4" width="2" height="3" fill="#0284c7" />
          </>
        ) : direction === 'right' ? (
          <>
            <rect x="5" y="4" width="7" height="4" fill="#fed7aa" />
            <rect x="4" y="3" width="3" height="5" fill="#92400e" />
            <rect x="9" y="5" width="2" height="2" fill="#0f172a" />
            <rect x="6" y="4" width="2" height="3" fill="#0284c7" />
          </>
        ) : (
          <>
            <rect x="5" y="4" width="6" height="4" fill="#fed7aa" />
            {/* Eyes + Indie Glasses */}
            <rect x="6" y="5" width="1" height="2" fill="#0f172a" />
            <rect x="9" y="5" width="1" height="2" fill="#0f172a" />
            <rect x="5" y="5" width="6" height="1" fill="rgba(56,189,248,0.45)" />
            {/* Headphones */}
            <rect x="3" y="4" width="2" height="3" fill="#0284c7" />
            <rect x="11" y="4" width="2" height="3" fill="#0284c7" />
          </>
        )}

        {/* Indie Dev Hoodie (Indigo / Slate) */}
        <rect x="4" y="8" width="8" height="5" fill="#4f46e5" />
        {/* Hoodie Pocket / Collar */}
        {direction !== 'up' && (
          <>
            <rect x="6" y="8" width="4" height="1" fill="#818cf8" />
            <rect x="6" y="10" width="4" height="2" fill="#3730a3" />
          </>
        )}

        {/* Arms */}
        <rect
          x="3"
          y={isMoving && walkFrame === 1 ? 8 : 9}
          width="1"
          height="3"
          fill="#4338ca"
        />
        <rect
          x="12"
          y={isMoving && walkFrame === 0 ? 8 : 9}
          width="1"
          height="3"
          fill="#4338ca"
        />
        <rect x="3" y="11" width="1" height="1" fill="#fed7aa" />
        <rect x="12" y="11" width="1" height="1" fill="#fed7aa" />

        {/* Pants / Sneakers */}
        <rect x="5" y={leftLegY} width="2" height="2" fill="#1e293b" />
        <rect x="9" y={rightLegY} width="2" height="2" fill="#1e293b" />
        <rect x="5" y={leftLegY + 1} width="2" height="1" fill="#f8fafc" />
        <rect x="9" y={rightLegY + 1} width="2" height="1" fill="#f8fafc" />
      </g>
    </svg>
  );
};

/**
 * Resident NPC Sprite inside each room
 */
export const PixelAgentSprite: React.FC<{
  shirtColor: string;
  hairColor: string;
  className?: string;
}> = ({ shirtColor, hairColor, className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 16 16"
    shapeRendering="crispEdges"
    className={`pixelated select-none shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect x="4" y="14" width="8" height="2" fill="rgba(0,0,0,0.45)" />
    <rect x="5" y="1" width="6" height="2" fill={hairColor} />
    <rect x="4" y="2" width="8" height="2" fill={hairColor} />
    <rect x="5" y="4" width="6" height="4" fill="#fcd34d" />
    <rect x="6" y="5" width="1" height="2" fill="#0f172a" />
    <rect x="9" y="5" width="1" height="2" fill="#0f172a" />
    <rect x="3" y="4" width="2" height="3" fill="#334155" />
    <rect x="11" y="4" width="2" height="3" fill="#334155" />
    <rect x="4" y="8" width="8" height="4" fill={shirtColor} />
    <rect x="3" y="8" width="1" height="3" fill={shirtColor} />
    <rect x="12" y="8" width="1" height="3" fill={shirtColor} />
    <rect x="3" y="11" width="1" height="1" fill="#fcd34d" />
    <rect x="12" y="11" width="1" height="1" fill="#fcd34d" />
    <rect x="5" y="12" width="2" height="2" fill="#1e293b" />
    <rect x="9" y="12" width="2" height="2" fill="#1e293b" />
  </svg>
);

/**
 * Beige CRT Monitor SVG (Master Hub & Room Portals)
 */
export const PixelCRTMonitorSVG: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg
    viewBox="0 0 24 24"
    shapeRendering="crispEdges"
    className={`pixelated select-none shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect x="3" y="2" width="18" height="15" fill="#d6d0c4" />
    <rect x="2" y="3" width="20" height="13" fill="#e6e1d6" />
    <rect x="4" y="4" width="16" height="11" fill="#8c867a" />
    <rect x="5" y="5" width="14" height="9" fill="#008080" />
    <rect x="7" y="6" width="10" height="6" fill="#c0c0c0" />
    <rect x="7" y="6" width="10" height="2" fill="#000080" />
    <rect x="8" y="9" width="3" height="2" fill="#ffffff" />
    <rect x="12" y="9" width="4" height="2" fill="#1084d0" />
    <rect x="17" y="15" width="2" height="1" fill="#22c55e" />
    <rect x="9" y="17" width="6" height="2" fill="#b8b2a6" />
    <rect x="6" y="19" width="12" height="2" fill="#d6d0c4" />
    <rect x="4" y="21" width="16" height="2" fill="#e6e1d6" />
    <rect x="5" y="21" width="14" height="1" fill="#94a3b8" />
  </svg>
);

/**
 * Custom Themed Furniture Props for each room
 */
export const StudioDecorSprite: React.FC<{ prop: StudioDecorProp }> = ({
  prop,
}) => {
  switch (prop.kind) {
    case 'server-rack':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-1">
          <div className="w-8 h-9 bg-slate-900 border-2 border-emerald-500/70 rounded-xs flex flex-col justify-between p-1 shadow-md">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              <span className="w-3 h-1 bg-emerald-500/40" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping" />
              <span className="w-3 h-1 bg-slate-700" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400" />
              <span className="w-3 h-1 bg-emerald-500/40" />
            </div>
          </div>
        </div>
      );

    case 'terminal-wall':
      return (
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full h-8 bg-slate-950 border-2 border-emerald-400/60 rounded-xs flex flex-col justify-center px-2 shadow-inner">
            <div className="font-pixel text-[10px] text-emerald-300 leading-none truncate">
              LLM_MATRIX
            </div>
            <div className="mt-1 h-1 w-3/4 bg-emerald-500/60" />
          </div>
        </div>
      );

    case 'art-easel':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="w-9 h-9 pixelated">
            <rect x="7" y="1" width="2" height="13" fill="#92400e" />
            <rect x="4" y="11" width="2" height="4" fill="#78350f" />
            <rect x="10" y="11" width="2" height="4" fill="#78350f" />
            <rect x="3" y="3" width="10" height="8" fill="#fdf4ff" />
            <rect x="4" y="4" width="4" height="3" fill="#d946ef" />
            <rect x="8" y="4" width="4" height="3" fill="#38bdf8" />
            <rect x="4" y="7" width="8" height="3" fill="#fbbf24" />
          </svg>
        </div>
      );

    case 'rgb-lamp':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-5 h-9 rounded-xs border-2 border-fuchsia-300/70 bg-gradient-to-b from-fuchsia-500 via-cyan-400 to-amber-400 shadow-[0_0_12px_rgba(217,70,239,0.5)]" />
        </div>
      );

    case 'palette-table':
      return (
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full h-8 bg-fuchsia-950/90 border-2 border-fuchsia-400/60 rounded-xs flex items-center justify-around px-1.5">
            <span className="w-2.5 h-2.5 bg-pink-400" />
            <span className="w-2.5 h-2.5 bg-cyan-400" />
            <span className="w-2.5 h-2.5 bg-amber-300" />
            <span className="w-2.5 h-2.5 bg-violet-400" />
          </div>
        </div>
      );

    case 'printer-3d':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-9 bg-stone-800 border-2 border-amber-400/70 rounded-xs relative flex flex-col items-center justify-end pb-1">
            <div className="w-5 h-1 bg-amber-400 animate-bounce mb-1" />
            <div className="w-6 h-2 bg-stone-950 border-t border-amber-500/50" />
          </div>
        </div>
      );

    case 'calculator-desk':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-amber-950 border-2 border-amber-400/60 rounded-xs p-1 flex flex-col gap-0.5">
            <div className="h-2 bg-emerald-900 border border-emerald-400/40" />
            <div className="grid grid-cols-3 gap-0.5 flex-1">
              <span className="bg-amber-200/70" />
              <span className="bg-amber-200/70" />
              <span className="bg-amber-400" />
              <span className="bg-amber-200/70" />
              <span className="bg-amber-200/70" />
              <span className="bg-amber-400" />
            </div>
          </div>
        </div>
      );

    case 'chart-board':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-9 h-8 bg-slate-900 border-2 border-amber-400/60 rounded-xs p-1 flex items-end gap-0.5">
            <span className="w-1.5 h-2 bg-amber-400" />
            <span className="w-1.5 h-4 bg-emerald-400" />
            <span className="w-1.5 h-3 bg-amber-300" />
            <span className="w-1.5 h-5 bg-emerald-300" />
          </div>
        </div>
      );

    case 'cockpit-sim':
      return (
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full h-8 bg-slate-900 border-2 border-cyan-400/70 rounded-xs flex items-center justify-between px-2 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <span className="w-2.5 h-4 bg-cyan-400/80" />
            <span className="font-pixel text-[10px] text-cyan-200">SIM-GT</span>
            <span className="w-2 h-2 bg-rose-500 animate-ping" />
          </div>
        </div>
      );

    case 'arcade-cabinet':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-9 bg-indigo-950 border-2 border-cyan-400 rounded-xs flex flex-col items-center p-0.5 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <div className="w-full h-1.5 bg-rose-500" />
            <div className="w-5 h-3 bg-cyan-300/90 my-0.5" />
            <div className="w-full h-2 bg-slate-800 flex items-center justify-center gap-1">
              <span className="w-1 h-1 bg-rose-400" />
              <span className="w-1 h-1 bg-amber-300" />
            </div>
          </div>
        </div>
      );

    case 'coffee-bar':
      return (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          <div className="w-full h-8 bg-amber-900 border-2 border-amber-300/60 rounded-xs flex items-center justify-between px-2 shadow-md">
            <span className="w-3 h-4 bg-slate-200 border border-slate-700" />
            <span className="font-pixel text-[11px] text-amber-100">CAFÉ PIXEL</span>
            <span className="w-2.5 h-3 bg-amber-950 border border-amber-400" />
          </div>
        </div>
      );

    case 'sofa':
      return (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          <div className="w-full h-8 bg-indigo-800 border-2 border-indigo-400/70 rounded-xs flex items-center justify-around px-2 shadow-md">
            <span className="w-8 h-4 bg-indigo-600 border border-indigo-300/40" />
            <span className="w-8 h-4 bg-indigo-600 border border-indigo-300/40" />
            <span className="w-8 h-4 bg-indigo-600 border border-indigo-300/40" />
          </div>
        </div>
      );

    case 'plant':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="w-8 h-8 pixelated">
            <rect x="5" y="10" width="6" height="5" fill="#b45309" />
            <rect x="4" y="9" width="8" height="2" fill="#d97706" />
            <rect x="5" y="4" width="6" height="5" fill="#16a34a" />
            <rect x="3" y="5" width="3" height="3" fill="#22c55e" />
            <rect x="10" y="5" width="3" height="3" fill="#22c55e" />
            <rect x="7" y="2" width="2" height="3" fill="#4ade80" />
          </svg>
        </div>
      );
  }
};

/**
 * Styled desk frame around an App Terminal based on the room's theme
 */
export const getDeskSurfaceClasses = (
  variant: PlacedAppTerminal['styleVariant'],
  isNearby: boolean,
  isTarget: boolean
): string => {
  const highlight = isTarget
    ? 'ring-2 ring-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.6)]'
    : isNearby
      ? 'ring-2 ring-white shadow-[0_0_14px_rgba(255,255,255,0.45)]'
      : '';

  switch (variant) {
    case 'cyber':
      return `bg-emerald-950/95 border-2 border-emerald-400/70 ${highlight}`;
    case 'design':
      return `bg-fuchsia-950/95 border-2 border-fuchsia-400/70 ${highlight}`;
    case 'arcade':
      return `bg-indigo-950/95 border-2 border-cyan-400/80 ${highlight}`;
    case 'lobby':
      return `bg-slate-900/95 border-2 border-indigo-400/70 ${highlight}`;
    case 'executive':
    default:
      return `bg-amber-950/95 border-2 border-amber-400/70 ${highlight}`;
  }
};
