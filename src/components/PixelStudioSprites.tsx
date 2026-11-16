import React from 'react';
import { AccentColor, WebAppItem } from '../types/launcher';
import {
  AppFurnitureStyle,
  CharacterDirection,
  StudioDecorProp,
} from '../utils/pixelStudioWorld';
import { AppLogo } from './AppLogo';

export const ACCENT_HEX_MAP: Record<AccentColor, string> = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#3b82f6',
  fuchsia: '#d946ef',
  purple: '#a855f7',
  orange: '#f97316',
};

/**
 * High-Detail 24x24 Controllable Indie Dev Player Sprite (4-direction + 2-frame stride)
 */
export const IndieDevPlayerSprite: React.FC<{
  direction: CharacterDirection;
  isMoving: boolean;
  walkFrame: 0 | 1;
}> = ({ direction, isMoving, walkFrame }) => {
  const leftLegOffset = isMoving ? (walkFrame === 0 ? -1 : 1) : 0;
  const rightLegOffset = isMoving ? (walkFrame === 1 ? -1 : 1) : 0;
  const bobOffset = isMoving ? (walkFrame === 0 ? -1 : 0) : 0;

  return (
    <svg
      viewBox="0 0 24 24"
      shapeRendering="crispEdges"
      className="w-11 h-11 pixelated select-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.75)]"
      aria-hidden="true"
    >
      {/* Crisp elliptical ground shadow */}
      <rect x="6" y="21" width="12" height="2" fill="rgba(0,0,0,0.55)" />
      <rect x="7" y="20" width="10" height="1" fill="rgba(0,0,0,0.35)" />

      <g transform={`translate(0, ${bobOffset})`}>
        {/* Outer Outline Silhouette for Head */}
        <rect x="7" y="1" width="10" height="1" fill="#0b0d14" />
        <rect x="6" y="2" width="12" height="2" fill="#0b0d14" />
        {/* Headphone Arc */}
        <rect x="7" y="2" width="10" height="1" fill="#38bdf8" />
        <rect x="8" y="2" width="8" height="1" fill="#7dd3fc" />

        {/* Hair Layer */}
        <rect x="7" y="3" width="10" height="3" fill="#78350f" />
        <rect x="8" y="3" width="8" height="2" fill="#b45309" />
        <rect x="9" y="4" width="3" height="1" fill="#d97706" />

        {direction === 'up' ? (
          <>
            <rect x="6" y="4" width="12" height="7" fill="#0b0d14" />
            <rect x="7" y="4" width="10" height="6" fill="#78350f" />
            <rect x="8" y="5" width="8" height="3" fill="#92400e" />
            <rect x="5" y="6" width="2" height="4" fill="#0284c7" />
            <rect x="17" y="6" width="2" height="4" fill="#0284c7" />
          </>
        ) : direction === 'left' ? (
          <>
            <rect x="6" y="5" width="11" height="6" fill="#0b0d14" />
            <rect x="7" y="6" width="6" height="5" fill="#fed7aa" />
            <rect x="12" y="5" width="5" height="6" fill="#78350f" />
            <rect x="8" y="7" width="2" height="2" fill="#0f172a" />
            <rect x="7" y="7" width="4" height="1" fill="rgba(56,189,248,0.65)" />
            <rect x="12" y="6" width="3" height="4" fill="#0284c7" />
            <rect x="13" y="7" width="1" height="2" fill="#7dd3fc" />
          </>
        ) : direction === 'right' ? (
          <>
            <rect x="7" y="5" width="11" height="6" fill="#0b0d14" />
            <rect x="11" y="6" width="6" height="5" fill="#fed7aa" />
            <rect x="7" y="5" width="5" height="6" fill="#78350f" />
            <rect x="14" y="7" width="2" height="2" fill="#0f172a" />
            <rect x="13" y="7" width="4" height="1" fill="rgba(56,189,248,0.65)" />
            <rect x="9" y="6" width="3" height="4" fill="#0284c7" />
            <rect x="10" y="7" width="1" height="2" fill="#7dd3fc" />
          </>
        ) : (
          <>
            <rect x="6" y="5" width="12" height="6" fill="#0b0d14" />
            <rect x="7" y="6" width="10" height="5" fill="#fed7aa" />
            <rect x="7" y="6" width="10" height="1" fill="#fdba74" />
            {/* Glasses + Eyes */}
            <rect x="8" y="7" width="3" height="2" fill="#0f172a" />
            <rect x="13" y="7" width="3" height="2" fill="#0f172a" />
            <rect x="8" y="7" width="3" height="1" fill="#38bdf8" />
            <rect x="13" y="7" width="3" height="1" fill="#38bdf8" />
            <rect x="11" y="7" width="2" height="1" fill="#0f172a" />
            {/* Cheek highlights */}
            <rect x="7" y="9" width="2" height="1" fill="#fb923c" opacity="0.45" />
            <rect x="15" y="9" width="2" height="1" fill="#fb923c" opacity="0.45" />
            {/* Headphones */}
            <rect x="5" y="6" width="2" height="4" fill="#0284c7" />
            <rect x="17" y="6" width="2" height="4" fill="#0284c7" />
            <rect x="5" y="7" width="1" height="2" fill="#7dd3fc" />
            <rect x="18" y="7" width="1" height="2" fill="#7dd3fc" />
          </>
        )}

        {/* Indie Hoodie Torso Outline + Fill */}
        <rect x="5" y="11" width="14" height="8" fill="#0b0d14" />
        <rect x="6" y="11" width="12" height="7" fill="#4f46e5" />
        <rect x="7" y="12" width="10" height="5" fill="#6366f1" />

        {direction !== 'up' && (
          <>
            {/* Hoodie Collar & Drawstrings */}
            <rect x="9" y="11" width="6" height="1" fill="#312e81" />
            <rect x="10" y="12" width="1" height="2" fill="#e2e8f0" />
            <rect x="13" y="12" width="1" height="2" fill="#e2e8f0" />
            {/* Kangaroo Pocket */}
            <rect x="8" y="15" width="8" height="2" fill="#3730a3" />
          </>
        )}

        {/* Arms + Hands */}
        <rect
          x="5"
          y={12 + (isMoving && walkFrame === 1 ? -1 : 0)}
          width="2"
          height="4"
          fill="#4338ca"
        />
        <rect
          x="17"
          y={12 + (isMoving && walkFrame === 0 ? -1 : 0)}
          width="2"
          height="4"
          fill="#4338ca"
        />
        <rect
          x="5"
          y={16 + (isMoving && walkFrame === 1 ? -1 : 0)}
          width="2"
          height="2"
          fill="#fed7aa"
        />
        <rect
          x="17"
          y={16 + (isMoving && walkFrame === 0 ? -1 : 0)}
          width="2"
          height="2"
          fill="#fed7aa"
        />

        {/* Legs + Sneakers */}
        <rect x="7" y={18 + leftLegOffset} width="4" height="3" fill="#0b0d14" />
        <rect x="8" y={18 + leftLegOffset} width="2" height="2" fill="#1e293b" />
        <rect x="8" y={20 + leftLegOffset} width="2" height="1" fill="#f8fafc" />

        <rect x="13" y={18 + rightLegOffset} width="4" height="3" fill="#0b0d14" />
        <rect x="14" y={18 + rightLegOffset} width="2" height="2" fill="#1e293b" />
        <rect x="14" y={20 + rightLegOffset} width="2" height="1" fill="#f8fafc" />
      </g>
    </svg>
  );
};

/**
 * Resident 24x24 Pixel NPC Sprite inside each room
 */
export const PixelAgentSprite: React.FC<{
  shirtColor: string;
  hairColor: string;
  className?: string;
}> = ({ shirtColor, hairColor, className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 24 24"
    shapeRendering="crispEdges"
    className={`pixelated select-none shrink-0 drop-shadow-[0_3px_3px_rgba(0,0,0,0.65)] ${className}`}
    aria-hidden="true"
  >
    <rect x="6" y="21" width="12" height="2" fill="rgba(0,0,0,0.5)" />
    {/* Head & Hair */}
    <rect x="6" y="2" width="12" height="10" fill="#0b0d14" />
    <rect x="7" y="3" width="10" height="3" fill={hairColor} />
    <rect x="8" y="3" width="6" height="1" fill="rgba(255,255,255,0.35)" />
    <rect x="7" y="6" width="10" height="5" fill="#fed7aa" />
    <rect x="8" y="7" width="2" height="2" fill="#0f172a" />
    <rect x="14" y="7" width="2" height="2" fill="#0f172a" />
    <rect x="8" y="7" width="1" height="1" fill="#ffffff" />
    <rect x="14" y="7" width="1" height="1" fill="#ffffff" />
    {/* Headset */}
    <rect x="5" y="6" width="2" height="4" fill="#334155" />
    <rect x="17" y="6" width="2" height="4" fill="#334155" />
    {/* Hoodie / Shirt */}
    <rect x="5" y="12" width="14" height="6" fill="#0b0d14" />
    <rect x="6" y="12" width="12" height="5" fill={shirtColor} />
    <rect x="7" y="12" width="10" height="1" fill="rgba(255,255,255,0.28)" />
    <rect x="10" y="13" width="4" height="3" fill="rgba(0,0,0,0.2)" />
    {/* Hands */}
    <rect x="5" y="16" width="2" height="2" fill="#fed7aa" />
    <rect x="17" y="16" width="2" height="2" fill="#fed7aa" />
    {/* Legs & Shoes */}
    <rect x="7" y="18" width="4" height="3" fill="#0b0d14" />
    <rect x="8" y="18" width="2" height="2" fill="#1e293b" />
    <rect x="8" y="20" width="2" height="1" fill="#f8fafc" />
    <rect x="13" y="18" width="4" height="3" fill="#0b0d14" />
    <rect x="14" y="18" width="2" height="2" fill="#1e293b" />
    <rect x="14" y="20" width="2" height="1" fill="#f8fafc" />
  </svg>
);

/**
 * 24x24 Directional Animated Pixel Developer NPC Sprite (walks between rooms)
 */
export const PixelDeveloperNPCSprite: React.FC<{
  direction: CharacterDirection;
  isMoving: boolean;
  walkFrame: 0 | 1;
  shirtColor: string;
  hairColor: string;
  pantsColor: string;
  accessory: 'glasses' | 'headset' | 'coffee' | 'cap';
}> = ({
  direction,
  isMoving,
  walkFrame,
  shirtColor,
  hairColor,
  pantsColor,
  accessory,
}) => {
  const leftLegOffset = isMoving ? (walkFrame === 0 ? -1 : 1) : 0;
  const rightLegOffset = isMoving ? (walkFrame === 1 ? -1 : 1) : 0;
  const bobOffset = isMoving ? (walkFrame === 0 ? -1 : 0) : 0;

  return (
    <svg
      viewBox="0 0 24 24"
      shapeRendering="crispEdges"
      className="w-10 h-10 pixelated select-none drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)]"
      aria-hidden="true"
    >
      {/* Elliptical ground shadow */}
      <rect x="6" y="21" width="12" height="2" fill="rgba(0,0,0,0.5)" />
      <rect x="7" y="20" width="10" height="1" fill="rgba(0,0,0,0.3)" />

      <g transform={`translate(0, ${bobOffset})`}>
        {/* Head Outline */}
        <rect x="6" y="2" width="12" height="9" fill="#0b0d14" />
        {/* Hair / Cap */}
        <rect x="7" y="3" width="10" height="3" fill={hairColor} />
        <rect x="8" y="3" width="6" height="1" fill="rgba(255,255,255,0.35)" />
        {accessory === 'cap' && (
          <rect
            x={direction === 'left' ? 5 : 7}
            y="4"
            width="11"
            height="2"
            fill={shirtColor}
          />
        )}

        {direction === 'up' ? (
          <rect x="7" y="5" width="10" height="5" fill={hairColor} />
        ) : direction === 'left' ? (
          <>
            <rect x="7" y="6" width="6" height="5" fill="#fed7aa" />
            <rect x="12" y="5" width="5" height="6" fill={hairColor} />
            <rect x="8" y="7" width="2" height="2" fill="#0f172a" />
            {accessory === 'glasses' && (
              <rect x="7" y="7" width="4" height="1" fill="#38bdf8" />
            )}
          </>
        ) : direction === 'right' ? (
          <>
            <rect x="11" y="6" width="6" height="5" fill="#fed7aa" />
            <rect x="7" y="5" width="5" height="6" fill={hairColor} />
            <rect x="14" y="7" width="2" height="2" fill="#0f172a" />
            {accessory === 'glasses' && (
              <rect x="13" y="7" width="4" height="1" fill="#38bdf8" />
            )}
          </>
        ) : (
          <>
            <rect x="7" y="6" width="10" height="5" fill="#fed7aa" />
            <rect x="8" y="7" width="2" height="2" fill="#0f172a" />
            <rect x="14" y="7" width="2" height="2" fill="#0f172a" />
            {accessory === 'glasses' && (
              <>
                <rect x="8" y="7" width="3" height="1" fill="#38bdf8" />
                <rect x="13" y="7" width="3" height="1" fill="#38bdf8" />
                <rect x="11" y="7" width="2" height="1" fill="#0f172a" />
              </>
            )}
          </>
        )}

        {accessory === 'headset' && (
          <>
            <rect x="5" y="6" width="2" height="4" fill="#f43f5e" />
            <rect x="17" y="6" width="2" height="4" fill="#f43f5e" />
          </>
        )}

        {/* Developer Hoodie / Shirt */}
        <rect x="5" y="11" width="14" height="7" fill="#0b0d14" />
        <rect x="6" y="11" width="12" height="6" fill={shirtColor} />
        <rect x="7" y="12" width="10" height="1" fill="rgba(255,255,255,0.28)" />
        {direction !== 'up' && (
          <rect x="9" y="13" width="6" height="3" fill="rgba(0,0,0,0.2)" />
        )}

        {/* Arms + Hands + Optional Coffee Mug */}
        <rect
          x="5"
          y={12 + (isMoving && walkFrame === 1 ? -1 : 0)}
          width="2"
          height="4"
          fill={shirtColor}
        />
        <rect
          x="17"
          y={12 + (isMoving && walkFrame === 0 ? -1 : 0)}
          width="2"
          height="4"
          fill={shirtColor}
        />
        <rect
          x="5"
          y={16 + (isMoving && walkFrame === 1 ? -1 : 0)}
          width="2"
          height="2"
          fill="#fed7aa"
        />
        <rect
          x="17"
          y={16 + (isMoving && walkFrame === 0 ? -1 : 0)}
          width="2"
          height="2"
          fill={accessory === 'coffee' ? '#ffffff' : '#fed7aa'}
        />
        {accessory === 'coffee' && (
          <rect
            x="17"
            y={15 + (isMoving && walkFrame === 0 ? -1 : 0)}
            width="2"
            height="1"
            fill="#78350f"
          />
        )}

        {/* Legs + Sneakers */}
        <rect x="7" y={18 + leftLegOffset} width="4" height="3" fill="#0b0d14" />
        <rect x="8" y={18 + leftLegOffset} width="2" height="2" fill={pantsColor} />
        <rect x="8" y={20 + leftLegOffset} width="2" height="1" fill="#f8fafc" />

        <rect x="13" y={18 + rightLegOffset} width="4" height="3" fill="#0b0d14" />
        <rect x="14" y={18 + rightLegOffset} width="2" height="2" fill={pantsColor} />
        <rect x="14" y={20 + rightLegOffset} width="2" height="1" fill="#f8fafc" />
      </g>
    </svg>
  );
};

/**
 * High-Detail 28x24 Beige CRT Monitor SVG (Master Hub & Room Portals)
 */
export const PixelCRTMonitorSVG: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg
    viewBox="0 0 28 24"
    shapeRendering="crispEdges"
    className={`pixelated select-none shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Desk Stand Shadow */}
    <rect x="3" y="21" width="22" height="2" fill="rgba(0,0,0,0.45)" />
    {/* Outer Beige Case */}
    <rect x="3" y="1" width="22" height="16" fill="#0b0d14" />
    <rect x="4" y="2" width="20" height="14" fill="#d6d0c4" />
    <rect x="4" y="2" width="20" height="1" fill="#f5f2eb" />
    {/* Recessed Inner Bezel */}
    <rect x="5" y="3" width="18" height="12" fill="#8c867a" />
    {/* CRT Phosphor Teal Screen */}
    <rect x="6" y="4" width="16" height="10" fill="#008080" />
    {/* Mini Win95 Window inside CRT */}
    <rect x="8" y="5" width="12" height="7" fill="#c0c0c0" />
    <rect x="8" y="5" width="12" height="2" fill="#000080" />
    <rect x="18" y="5" width="1" height="1" fill="#ef4444" />
    <rect x="9" y="8" width="4" height="3" fill="#ffffff" />
    <rect x="14" y="8" width="5" height="3" fill="#1084d0" />
    {/* Power LED & Vent Slots */}
    <rect x="20" y="15" width="2" height="1" fill="#22c55e" />
    <rect x="6" y="15" width="4" height="1" fill="#78716c" />
    {/* Neck & Swivel Base */}
    <rect x="10" y="17" width="8" height="2" fill="#0b0d14" />
    <rect x="11" y="17" width="6" height="2" fill="#b8b2a6" />
    <rect x="7" y="19" width="14" height="2" fill="#0b0d14" />
    <rect x="8" y="19" width="12" height="1" fill="#e6e1d6" />
    {/* Pixel Mechanical Keyboard + Mouse */}
    <rect x="4" y="21" width="15" height="2" fill="#0b0d14" />
    <rect x="5" y="21" width="13" height="1" fill="#e6e1d6" />
    <rect x="21" y="21" width="3" height="2" fill="#0b0d14" />
    <rect x="22" y="21" width="1" height="1" fill="#e6e1d6" />
  </svg>
);

/**
 * Reusable Detailed 16x16 Pixel Swivel Chair SVG (matches reference image chairs!)
 */
const PixelSwivelChairSVG: React.FC<{
  seatColor: string;
  shadeColor: string;
  className?: string;
}> = ({ seatColor, shadeColor, className = 'w-5 h-6' }) => (
  <svg
    viewBox="0 0 16 18"
    shapeRendering="crispEdges"
    className={`pixelated select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    {/* Ground Shadow */}
    <rect x="3" y="15" width="10" height="2" fill="rgba(0,0,0,0.4)" />
    {/* 5-star caster legs */}
    <rect x="7" y="12" width="2" height="4" fill="#0b0d14" />
    <rect x="4" y="14" width="8" height="2" fill="#cbd5e1" />
    <rect x="3" y="15" width="2" height="2" fill="#0b0d14" />
    <rect x="11" y="15" width="2" height="2" fill="#0b0d14" />
    {/* Seat Cushion */}
    <rect x="3" y="7" width="10" height="6" fill="#0b0d14" />
    <rect x="4" y="8" width="8" height="4" fill={seatColor} />
    <rect x="4" y="11" width="8" height="1" fill={shadeColor} />
    {/* Curved Backrest */}
    <rect x="2" y="2" width="4" height="8" fill="#0b0d14" />
    <rect x="3" y="3" width="2" height="6" fill={seatColor} />
  </svg>
);

/**
 * Renders each registered App as a high-detail pixel-art themed machine/desk
 * with the real App Favicon/Logo glowing inside its screen.
 */
export const AppFurnitureStation: React.FC<{
  app: WebAppItem;
  variant: AppFurnitureStyle;
  isNearby: boolean;
  isTarget: boolean;
  clusterCount?: number;
}> = ({ app, variant, isNearby, isTarget, clusterCount }) => {
  const accentHex = ACCENT_HEX_MAP[app.accentColor] || '#6366f1';

  const proximityMat =
    isNearby || isTarget ? (
      <div
        style={{
          borderColor: accentHex,
          boxShadow: `0 0 18px ${accentHex}aa, inset 0 0 10px ${accentHex}66`,
          backgroundColor: `${accentHex}26`,
        }}
        className="pointer-events-none absolute -inset-1.5 rounded-md border-2 animate-pulse"
      />
    ) : null;

  if (variant === 'cluster-rack') {
    // High-Detail 34x36 Server Cluster Rack for Room Overflow (> 8 apps)
    return (
      <div className="relative w-[52px] h-[54px] -mt-2 flex items-center justify-center select-none">
        {proximityMat}
        <svg
          viewBox="0 0 34 36"
          shapeRendering="crispEdges"
          className="w-full h-full pixelated"
          aria-hidden="true"
        >
          <rect x="3" y="33" width="28" height="3" fill="rgba(0,0,0,0.65)" />
          {/* Heavy Server Rack Chassis */}
          <rect x="4" y="1" width="26" height="33" fill="#0b0d14" />
          <rect x="5" y="2" width="24" height="31" fill="#1e293b" />
          <rect x="5" y="2" width="2" height="31" fill="#334155" />
          <rect x="27" y="2" width="2" height="31" fill="#0f172a" />
          {/* Top Cluster Header Banner */}
          <rect x="7" y="3" width="20" height="4" fill="#06b6d4" />
          <rect x="9" y="4" width="16" height="2" fill="#cffafe" />
          {/* Server Blade 1 */}
          <rect x="7" y="8" width="20" height="4" fill="#090d16" />
          <rect x="8" y="9" width="2" height="2" fill="#10b981" />
          <rect x="11" y="9" width="2" height="2" fill="#22d3ee" />
          <rect x="14" y="9" width="2" height="2" fill="#f59e0b" />
          <rect x="18" y="9" width="8" height="2" fill="#334155" />
          {/* Central Terminal Display */}
          <rect x="7" y="13" width="20" height="12" fill="#090d16" />
          <rect x="8" y="14" width="18" height="10" fill="#083344" />
          {/* Lower Server Blades */}
          <rect x="7" y="26" width="20" height="3" fill="#090d16" />
          <rect x="8" y="27" width="2" height="1" fill="#22d3ee" />
          <rect x="11" y="27" width="2" height="1" fill="#10b981" />
          <rect x="15" y="27" width="11" height="1" fill="#475569" />
          <rect x="7" y="30" width="20" height="2" fill="#090d16" />
          <rect x="8" y="31" width="3" height="1" fill="#f43f5e" />
          <rect x="12" y="31" width="3" height="1" fill="#22d3ee" />
        </svg>
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-cyan-950/95 border border-cyan-400/60 text-[8px] font-mono font-bold text-cyan-200 tracking-tighter pointer-events-none shadow">
          +{clusterCount ?? 2} APPS
        </div>
      </div>
    );
  }

  if (variant === 'arcade') {
    // High-Detail 32x34 Pixel Art Arcade Cabinet
    return (
      <div className="relative w-[48px] h-[54px] -mt-2 flex items-center justify-center select-none">
        {proximityMat}
        <svg
          viewBox="0 0 32 36"
          shapeRendering="crispEdges"
          className="w-full h-full pixelated"
          aria-hidden="true"
        >
          {/* Shadow */}
          <rect x="3" y="33" width="26" height="3" fill="rgba(0,0,0,0.55)" />
          {/* Cabinet Dark Outline */}
          <rect x="4" y="1" width="24" height="33" fill="#0b0d14" />
          {/* Side Cabinet Panels */}
          <rect x="5" y="2" width="22" height="31" fill="#1e1b4b" />
          <rect x="5" y="2" width="2" height="31" fill="#312e81" />
          <rect x="25" y="2" width="2" height="31" fill="#17153b" />
          {/* Lit Top Marquee */}
          <rect x="6" y="3" width="20" height="5" fill={accentHex} />
          <rect x="8" y="4" width="16" height="2" fill="rgba(255,255,255,0.65)" />
          {/* Beveled CRT Frame */}
          <rect x="6" y="9" width="20" height="14" fill="#090d16" />
          <rect x="7" y="10" width="18" height="12" fill="#0f172a" />
          {/* Angled Control Deck */}
          <rect x="4" y="23" width="24" height="5" fill="#0b0d14" />
          <rect x="5" y="24" width="22" height="3" fill="#475569" />
          <rect x="5" y="24" width="22" height="1" fill="#64748b" />
          {/* Joystick + Arcade Buttons */}
          <rect x="8" y="22" width="1" height="3" fill="#cbd5e1" />
          <rect x="7" y="21" width="3" height="2" fill="#ef4444" />
          <rect x="17" y="25" width="2" height="1" fill="#fde047" />
          <rect x="20" y="24" width="2" height="1" fill="#22d3ee" />
          <rect x="23" y="25" width="2" height="1" fill="#4ade80" />
          {/* Coin Door Lower Front */}
          <rect x="7" y="29" width="18" height="4" fill="#0f172a" />
          <rect x="11" y="30" width="4" height="2" fill="#ef4444" />
          <rect x="17" y="30" width="4" height="2" fill="#ef4444" />
        </svg>
        {/* App Favicon glowing inside the CRT Screen */}
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[24px] h-[18px] flex items-center justify-center pointer-events-none">
          <div className="scale-[0.58]">
            <AppLogo
              name={app.name}
              url={app.url}
              accentColor={app.accentColor}
              customLogoUrl={app.customLogoUrl}
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'arcade-racing') {
    // High-Detail 34x36 Pixel Racing / Sports Simulator Cockpit
    return (
      <div className="relative w-[52px] h-[54px] -mt-2 flex items-center justify-center select-none">
        {proximityMat}
        <svg
          viewBox="0 0 34 36"
          shapeRendering="crispEdges"
          className="w-full h-full pixelated"
          aria-hidden="true"
        >
          <rect x="2" y="33" width="30" height="3" fill="rgba(0,0,0,0.6)" />
          {/* Racing Frame Outline */}
          <rect x="3" y="1" width="28" height="33" fill="#0b0d14" />
          <rect x="4" y="2" width="26" height="31" fill="#1e293b" />
          {/* Racing Side Decals */}
          <rect x="4" y="2" width="2" height="31" fill={accentHex} />
          <rect x="28" y="2" width="2" height="31" fill={accentHex} />
          {/* Top Checkered Marquee */}
          <rect x="6" y="3" width="22" height="4" fill={accentHex} />
          <rect x="8" y="4" width="3" height="2" fill="#ffffff" />
          <rect x="14" y="4" width="6" height="2" fill="#fde047" />
          <rect x="23" y="4" width="3" height="2" fill="#ffffff" />
          {/* Wide Cockpit Display */}
          <rect x="6" y="8" width="22" height="14" fill="#090d16" />
          {/* Steering Wheel & Dashboard */}
          <rect x="6" y="23" width="22" height="4" fill="#334155" />
          <rect x="13" y="22" width="8" height="4" fill="#0b0d14" />
          <rect x="14" y="23" width="6" height="2" fill="#94a3b8" />
          <rect x="16" y="23" width="2" height="2" fill="#ef4444" />
          {/* Bucket Seat + Bolsters */}
          <rect x="9" y="28" width="16" height="5" fill="#0b0d14" />
          <rect x="10" y="28" width="14" height="4" fill="#dc2626" />
          <rect x="12" y="29" width="10" height="2" fill="#991b1b" />
        </svg>
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[26px] h-[18px] flex items-center justify-center pointer-events-none">
          <div className="scale-[0.58]">
            <AppLogo
              name={app.name}
              url={app.url}
              accentColor={app.accentColor}
              customLogoUrl={app.customLogoUrl}
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'cyber') {
    // High-Detail 36x32 Dev / Hacker Workstation + Emerald Swivel Chair + Coiled Cables
    return (
      <div className="relative w-[56px] h-[50px] -mt-1 flex items-center justify-center select-none">
        {proximityMat}
        <div className="absolute -left-2.5 bottom-0.5 z-10">
          <PixelSwivelChairSVG seatColor="#10b981" shadeColor="#047857" />
        </div>
        <svg
          viewBox="0 0 36 32"
          shapeRendering="crispEdges"
          className="w-full h-full pixelated"
          aria-hidden="true"
        >
          <rect x="3" y="29" width="30" height="3" fill="rgba(0,0,0,0.55)" />
          {/* Desk Legs */}
          <rect x="5" y="26" width="3" height="5" fill="#0b0d14" />
          <rect x="28" y="26" width="3" height="5" fill="#0b0d14" />
          {/* Dark Carbon Desk Frame */}
          <rect x="3" y="3" width="30" height="24" fill="#0b0d14" />
          <rect x="4" y="4" width="28" height="22" fill="#1e293b" />
          <rect x="4" y="4" width="28" height="2" fill="#334155" />
          {/* Widescreen Hacker Monitor */}
          <rect x="5" y="5" width="20" height="14" fill="#090d16" />
          <rect x="6" y="6" width="18" height="12" fill="#022c22" />
          {/* Glowing PC Tower on Right */}
          <rect x="26" y="5" width="5" height="14" fill="#090d16" />
          <rect x="27" y="6" width="3" height="12" fill="#0f172a" />
          <rect x="28" y="7" width="1" height="2" fill="#10b981" />
          <rect x="28" y="11" width="1" height="2" fill="#22d3ee" />
          <rect x="28" y="15" width="1" height="1" fill="#34d399" />
          {/* RGB Mechanical Keyboard + Coiled Mouse Cable */}
          <rect x="6" y="21" width="14" height="4" fill="#090d16" />
          <rect x="7" y="22" width="12" height="1" fill="#94a3b8" />
          <rect x="7" y="23" width="12" height="1" fill="#10b981" />
          <rect x="22" y="21" width="3" height="3" fill="#090d16" />
          <rect x="23" y="22" width="1" height="1" fill="#22d3ee" />
          <rect x="24" y="19" width="2" height="2" fill="#0b0d14" />
        </svg>
        <div className="absolute top-[9px] left-[9px] w-[28px] h-[19px] flex items-center justify-center pointer-events-none">
          <div className="scale-[0.56]">
            <AppLogo
              name={app.name}
              url={app.url}
              accentColor={app.accentColor}
              customLogoUrl={app.customLogoUrl}
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'design') {
    // High-Detail 36x32 Design Cintiq Desk + Blue Swivel Chair + Ring Light + Palette
    return (
      <div className="relative w-[56px] h-[50px] -mt-1 flex items-center justify-center select-none">
        {proximityMat}
        <div className="absolute -right-2.5 bottom-0.5 z-10">
          <PixelSwivelChairSVG seatColor="#0ea5e9" shadeColor="#0369a1" />
        </div>
        <svg
          viewBox="0 0 36 32"
          shapeRendering="crispEdges"
          className="w-full h-full pixelated"
          aria-hidden="true"
        >
          <rect x="3" y="29" width="30" height="3" fill="rgba(0,0,0,0.5)" />
          <rect x="5" y="26" width="3" height="5" fill="#0b0d14" />
          <rect x="28" y="26" width="3" height="5" fill="#0b0d14" />
          {/* Modern Light Studio Desk */}
          <rect x="3" y="3" width="30" height="24" fill="#0b0d14" />
          <rect x="4" y="4" width="28" height="22" fill="#fae8ff" />
          <rect x="4" y="23" width="28" height="3" fill="#e9d5ff" />
          {/* Tilted Pen Display (Cintiq) */}
          <rect x="5" y="5" width="20" height="14" fill="#0b0d14" />
          <rect x="6" y="6" width="18" height="12" fill="#1e1b4b" />
          {/* Mini Ring Light Stand */}
          <rect x="26" y="5" width="5" height="6" fill="#0b0d14" />
          <rect x="27" y="6" width="3" height="4" fill="#f0abfc" />
          <rect x="28" y="7" width="1" height="2" fill="#ffffff" />
          <rect x="28" y="11" width="1" height="6" fill="#475569" />
          {/* Color Palette + Stylus Pen */}
          <rect x="6" y="21" width="10" height="3" fill="#ffffff" />
          <rect x="7" y="22" width="2" height="1" fill="#ec4899" />
          <rect x="10" y="22" width="2" height="1" fill="#06b6d4" />
          <rect x="13" y="22" width="2" height="1" fill="#f59e0b" />
          <rect x="18" y="22" width="6" height="1" fill="#1e293b" />
        </svg>
        <div className="absolute top-[9px] left-[9px] w-[28px] h-[19px] flex items-center justify-center pointer-events-none">
          <div className="scale-[0.56]">
            <AppLogo
              name={app.name}
              url={app.url}
              accentColor={app.accentColor}
              customLogoUrl={app.customLogoUrl}
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'executive') {
    // High-Detail 36x32 Warm Wood Executive Desk + Red Swivel Chair + Calculator + Coffee + Papers
    return (
      <div className="relative w-[56px] h-[50px] -mt-1 flex items-center justify-center select-none">
        {proximityMat}
        <div className="absolute -left-2.5 bottom-0.5 z-10">
          <PixelSwivelChairSVG seatColor="#ef4444" shadeColor="#b91c1c" />
        </div>
        <svg
          viewBox="0 0 36 32"
          shapeRendering="crispEdges"
          className="w-full h-full pixelated"
          aria-hidden="true"
        >
          <rect x="3" y="29" width="30" height="3" fill="rgba(0,0,0,0.55)" />
          {/* Wooden Desk Legs */}
          <rect x="5" y="26" width="3" height="5" fill="#0b0d14" />
          <rect x="6" y="26" width="1" height="4" fill="#9a5628" />
          <rect x="28" y="26" width="3" height="5" fill="#0b0d14" />
          <rect x="29" y="26" width="1" height="4" fill="#9a5628" />
          {/* Warm Wood Table Surface */}
          <rect x="3" y="3" width="30" height="24" fill="#0b0d14" />
          <rect x="4" y="4" width="28" height="22" fill="#dd9b60" />
          <rect x="4" y="4" width="28" height="2" fill="#f5c99b" />
          <rect x="4" y="23" width="28" height="3" fill="#ba753b" />
          {/* Monitor Bezel */}
          <rect x="5" y="5" width="19" height="14" fill="#0b0d14" />
          <rect x="6" y="6" width="17" height="12" fill="#1e293b" />
          {/* Stacked Reports / Papers + Coffee Mug */}
          <rect x="25" y="5" width="6" height="6" fill="#0b0d14" />
          <rect x="26" y="6" width="4" height="4" fill="#ffffff" />
          <rect x="27" y="7" width="2" height="1" fill="#94a3b8" />
          <rect x="26" y="13" width="4" height="4" fill="#0b0d14" />
          <rect x="27" y="14" width="2" height="2" fill="#78350f" />
          {/* Keyboard + Wired Mouse + Desktop Calculator */}
          <rect x="6" y="20" width="12" height="3" fill="#0b0d14" />
          <rect x="7" y="21" width="10" height="1" fill="#64748b" />
          <rect x="19" y="21" width="3" height="2" fill="#0b0d14" />
          <rect x="24" y="19" width="6" height="5" fill="#0b0d14" />
          <rect x="25" y="20" width="4" height="1" fill="#6ee7b7" />
          <rect x="25" y="22" width="4" height="1" fill="#e2e8f0" />
        </svg>
        <div className="absolute top-[9px] left-[9px] w-[26px] h-[19px] flex items-center justify-center pointer-events-none">
          <div className="scale-[0.56]">
            <AppLogo
              name={app.name}
              url={app.url}
              accentColor={app.accentColor}
              customLogoUrl={app.customLogoUrl}
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  // Lobby Quick-Access Kiosk
  return (
    <div className="relative w-[48px] h-[48px] flex items-center justify-center select-none">
      {proximityMat}
      <svg
        viewBox="0 0 28 28"
        shapeRendering="crispEdges"
        className="w-full h-full pixelated"
        aria-hidden="true"
      >
        <rect x="3" y="25" width="22" height="2" fill="rgba(0,0,0,0.5)" />
        <rect x="3" y="2" width="22" height="23" fill="#0b0d14" />
        <rect x="4" y="3" width="20" height="21" fill="#312e81" />
        <rect x="5" y="4" width="18" height="14" fill="#0f172a" />
        <rect x="6" y="20" width="16" height="2" fill="#818cf8" />
      </svg>
      <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[26px] h-[20px] flex items-center justify-center pointer-events-none">
        <div className="scale-[0.58]">
          <AppLogo
            name={app.name}
            url={app.url}
            accentColor={app.accentColor}
            customLogoUrl={app.customLogoUrl}
            size="xs"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * High-Detail Top-Down Pixel Art Room Scenery & Furniture Props
 */
export const StudioDecorSprite: React.FC<{ prop: StudioDecorProp }> = ({
  prop,
}) => {
  switch (prop.kind) {
    case 'server-rack':
      return (
        <svg viewBox="0 0 72 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          {[0, 24, 48].map((ox, i) => (
            <g key={i} transform={`translate(${ox}, 0)`}>
              <rect x="1" y="2" width="20" height="24" fill="#0b0d14" />
              <rect x="2" y="3" width="18" height="22" fill="#1e293b" />
              <rect x="3" y="4" width="16" height="5" fill="#0f172a" />
              <rect x="4" y="5" width="2" height="2" fill="#10b981" />
              <rect x="8" y="5" width="2" height="2" fill="#ef4444" />
              <rect x="12" y="5" width="6" height="2" fill="#334155" />
              <rect x="3" y="11" width="16" height="5" fill="#0f172a" />
              <rect x="4" y="12" width="2" height="2" fill="#22d3ee" />
              <rect x="8" y="12" width="2" height="2" fill="#10b981" />
              <rect x="12" y="12" width="6" height="2" fill="#334155" />
              <rect x="3" y="18" width="16" height="5" fill="#0f172a" />
              <rect x="4" y="19" width="14" height="1" fill="#475569" />
              <rect x="4" y="21" width="14" height="1" fill="#475569" />
            </g>
          ))}
        </svg>
      );

    case 'whiteboard-flow':
      return (
        <svg viewBox="0 0 72 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="1" y="2" width="70" height="23" fill="#0b0d14" />
          <rect x="2" y="3" width="68" height="21" fill="#f8fafc" />
          <rect x="2" y="22" width="68" height="2" fill="#cbd5e1" />
          {/* Flowchart Boxes & Connectors */}
          <rect x="6" y="6" width="12" height="6" fill="#10b981" />
          <rect x="18" y="8" width="7" height="2" fill="#334155" />
          <rect x="25" y="6" width="14" height="6" fill="#06b6d4" />
          <rect x="39" y="8" width="7" height="2" fill="#334155" />
          <rect x="46" y="6" width="18" height="6" fill="#6366f1" />
          <rect x="10" y="15" width="22" height="2" fill="#94a3b8" />
          <rect x="36" y="15" width="16" height="2" fill="#f43f5e" />
          {/* Dry-erase marker tray */}
          <rect x="10" y="22" width="6" height="2" fill="#ef4444" />
          <rect x="18" y="22" width="6" height="2" fill="#10b981" />
        </svg>
      );

    case 'terminal-wall':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="1" y="2" width="46" height="24" fill="#0b0d14" />
          <rect x="2" y="3" width="44" height="22" fill="#022c22" />
          <rect x="4" y="5" width="18" height="2" fill="#34d399" />
          <rect x="4" y="9" width="28" height="2" fill="#10b981" />
          <rect x="4" y="13" width="20" height="2" fill="#22d3ee" />
          <rect x="4" y="17" width="32" height="2" fill="#059669" />
          <rect x="38" y="5" width="4" height="16" fill="#064e3b" />
        </svg>
      );

    case 'vending-drink':
    case 'vending-machine': {
      const isEnergy = prop.kind === 'vending-drink';
      return (
        <svg viewBox="0 0 24 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="2" y="1" width="20" height="26" fill="#0b0d14" />
          <rect x="3" y="2" width="18" height="24" fill={isEnergy ? '#065f46' : '#be123c'} />
          <rect x="4" y="4" width="12" height="14" fill="#cffafe" />
          {/* Cans / Snacks */}
          <rect x="5" y="5" width="3" height="3" fill="#10b981" />
          <rect x="9" y="5" width="3" height="3" fill="#f59e0b" />
          <rect x="13" y="5" width="2" height="3" fill="#ef4444" />
          <rect x="5" y="10" width="3" height="3" fill="#3b82f6" />
          <rect x="9" y="10" width="3" height="3" fill="#d946ef" />
          <rect x="13" y="10" width="2" height="3" fill="#22c55e" />
          {/* Keypad & Dispenser */}
          <rect x="17" y="6" width="3" height="7" fill="#0f172a" />
          <rect x="5" y="20" width="12" height="4" fill="#0f172a" />
        </svg>
      );
    }

    case 'boxes-stack':
    case 'cardboard-boxes':
      return (
        <svg viewBox="0 0 24 24" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="1" y="10" width="11" height="11" fill="#0b0d14" />
          <rect x="2" y="11" width="9" height="9" fill="#d99b66" />
          <rect x="2" y="11" width="9" height="2" fill="#f0b884" />
          <rect x="12" y="12" width="11" height="9" fill="#0b0d14" />
          <rect x="13" y="13" width="9" height="7" fill="#c78854" />
          <rect x="4" y="2" width="11" height="9" fill="#0b0d14" />
          <rect x="5" y="3" width="9" height="7" fill="#e5ae7c" />
          <rect x="5" y="3" width="9" height="2" fill="#fbd2a8" />
        </svg>
      );

    case 'framed-art':
      return (
        <svg viewBox="0 0 72 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          {/* Frame 1 */}
          <rect x="2" y="3" width="18" height="20" fill="#0b0d14" />
          <rect x="3" y="4" width="16" height="18" fill="#fef3c7" />
          <rect x="5" y="6" width="12" height="14" fill="#d946ef" />
          <rect x="7" y="8" width="6" height="6" fill="#38bdf8" />
          {/* Neon STUDIO Sign */}
          <rect x="24" y="6" width="24" height="12" fill="#0b0d14" />
          <rect x="25" y="7" width="22" height="10" fill="#1e1b4b" />
          <rect x="27" y="10" width="18" height="4" fill="#f0abfc" />
          {/* Frame 2 */}
          <rect x="52" y="3" width="18" height="20" fill="#0b0d14" />
          <rect x="53" y="4" width="16" height="18" fill="#fef3c7" />
          <rect x="55" y="6" width="12" height="14" fill="#6366f1" />
          <rect x="58" y="9" width="6" height="7" fill="#fbbf24" />
        </svg>
      );

    case 'photo-studio':
      return (
        <svg viewBox="0 0 72 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="2" y="2" width="68" height="24" fill="#0b0d14" />
          <rect x="3" y="3" width="66" height="22" fill="#f1f5f9" />
          {/* Seamless Backdrop Curve */}
          <rect x="16" y="4" width="40" height="18" fill="#ffffff" />
          <rect x="16" y="19" width="40" height="3" fill="#e2e8f0" />
          {/* Left Softbox Tripod */}
          <rect x="6" y="6" width="7" height="10" fill="#0f172a" />
          <rect x="7" y="7" width="5" height="8" fill="#e0f2fe" />
          <rect x="9" y="16" width="1" height="8" fill="#334155" />
          {/* Right Softbox Tripod */}
          <rect x="59" y="6" width="7" height="10" fill="#0f172a" />
          <rect x="60" y="7" width="5" height="8" fill="#fae8ff" />
          <rect x="62" y="16" width="1" height="8" fill="#334155" />
        </svg>
      );

    case 'art-easel':
      return (
        <svg viewBox="0 0 24 24" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="11" y="2" width="2" height="19" fill="#92400e" />
          <rect x="6" y="16" width="3" height="6" fill="#78350f" />
          <rect x="15" y="16" width="3" height="6" fill="#78350f" />
          <rect x="4" y="4" width="16" height="12" fill="#0b0d14" />
          <rect x="5" y="5" width="14" height="10" fill="#fdf4ff" />
          <rect x="6" y="6" width="6" height="5" fill="#d946ef" />
          <rect x="12" y="6" width="6" height="5" fill="#38bdf8" />
          <rect x="6" y="11" width="12" height="3" fill="#fbbf24" />
        </svg>
      );

    case 'rgb-lamp':
      return (
        <svg viewBox="0 0 24 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="8" y="2" width="8" height="24" fill="#0b0d14" />
          <rect x="9" y="3" width="6" height="7" fill="#d946ef" />
          <rect x="9" y="10" width="6" height="7" fill="#22d3ee" />
          <rect x="9" y="17" width="6" height="7" fill="#fbbf24" />
          <rect x="6" y="24" width="12" height="2" fill="#334155" />
        </svg>
      );

    case 'palette-table':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="2" y="3" width="44" height="21" fill="#0b0d14" />
          <rect x="3" y="4" width="42" height="19" fill="#581c87" />
          <rect x="6" y="7" width="6" height="6" fill="#f472b6" />
          <rect x="15" y="7" width="6" height="6" fill="#22d3ee" />
          <rect x="24" y="7" width="6" height="6" fill="#fde047" />
          <rect x="33" y="7" width="6" height="6" fill="#a78bfa" />
          <rect x="6" y="16" width="33" height="3" fill="#3b0764" />
        </svg>
      );

    case 'modern-puff':
      return (
        <svg viewBox="0 0 24 24" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="3" y="5" width="18" height="15" fill="#0b0d14" />
          <rect x="4" y="6" width="16" height="12" fill="#c026d3" />
          <rect x="6" y="7" width="12" height="5" fill="#e879f9" />
          <rect x="5" y="16" width="14" height="2" fill="#86198f" />
        </svg>
      );

    case 'wood-bookshelf':
      // High-Detail 72x28 Bookshelf + Colorful Book Spines + Drawers + Pinned Memo (Directly from Reference Image!)
      return (
        <svg viewBox="0 0 72 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          {/* Pinned White Wall Memo with Blue Sparkles above cabinet */}
          <rect x="14" y="0" width="12" height="9" fill="#0b0d14" />
          <rect x="15" y="1" width="10" height="7" fill="#ffffff" />
          <rect x="16" y="2" width="3" height="2" fill="#cbd5e1" />
          <rect x="20" y="2" width="4" height="1" fill="#94a3b8" />
          <rect x="16" y="5" width="7" height="1" fill="#94a3b8" />
          <rect x="25" y="0" width="2" height="2" fill="#7dd3fc" />
          <rect x="13" y="7" width="2" height="2" fill="#7dd3fc" />
          {/* Wooden Credenza Cabinet */}
          <rect x="1" y="6" width="70" height="21" fill="#0b0d14" />
          <rect x="2" y="7" width="68" height="19" fill="#c26d33" />
          <rect x="2" y="7" width="68" height="6" fill="#e08e52" />
          <rect x="2" y="7" width="68" height="1" fill="#f5b882" />
          {/* Top Papers Stack on Cabinet */}
          <rect x="33" y="8" width="6" height="4" fill="#0b0d14" />
          <rect x="34" y="9" width="4" height="2" fill="#ffffff" />
          <rect x="42" y="7" width="8" height="5" fill="#0b0d14" />
          <rect x="43" y="8" width="6" height="3" fill="#f8fafc" />
          <rect x="54" y="3" width="11" height="9" fill="#0b0d14" />
          <rect x="55" y="4" width="9" height="7" fill="#ffffff" />
          <rect x="56" y="6" width="6" height="1" fill="#94a3b8" />
          <rect x="56" y="8" width="7" height="1" fill="#94a3b8" />
          {/* Left Drawers with Knobs */}
          <rect x="4" y="14" width="28" height="5" fill="#78350f" />
          <rect x="5" y="15" width="26" height="3" fill="#b45a24" />
          <rect x="17" y="16" width="2" height="1" fill="#0b0d14" />
          <rect x="4" y="20" width="28" height="5" fill="#78350f" />
          <rect x="5" y="21" width="26" height="3" fill="#b45a24" />
          <rect x="17" y="22" width="2" height="1" fill="#0b0d14" />
          {/* Right Colorful Book Shelves */}
          <rect x="34" y="14" width="34" height="5" fill="#3b1d0c" />
          <rect x="34" y="20" width="34" height="5" fill="#3b1d0c" />
          {[
            '#06b6d4',
            '#22c55e',
            '#ef4444',
            '#eab308',
            '#ec4899',
            '#3b82f6',
            '#f97316',
            '#10b981',
            '#a855f7',
            '#facc15',
            '#38bdf8',
          ].map((col, idx) => (
            <React.Fragment key={idx}>
              <rect x={35 + idx * 3} y="15" width="2" height="3" fill={col} />
              <rect x={35 + idx * 3} y="21" width="2" height="3" fill={col} />
            </React.Fragment>
          ))}
        </svg>
      );

    case 'chart-board':
      // High-Detail Triple Glossy Window + Wooden Sill + Wall Outlet (Reference Image!)
      return (
        <svg viewBox="0 0 96 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          {/* Outer Dark Window Frame */}
          <rect x="4" y="2" width="78" height="22" fill="#0b0d14" />
          <rect x="5" y="3" width="76" height="19" fill="#94a3b8" />
          <rect x="5" y="3" width="76" height="1" fill="#cbd5e1" />
          {/* Three Glass Panes with Diagonal White Gloss Reflections */}
          {[7, 31, 55].map((wx, idx) => (
            <g key={idx}>
              <rect x={wx} y="5" width="22" height="15" fill="#7dd3fc" />
              <rect x={wx + 1} y="6" width="20" height="13" fill="#bae6fd" />
              <rect x={wx + 2} y="6" width="6" height="13" fill="#ffffff" opacity="0.88" />
              <rect x={wx + 11} y="8" width="4" height="11" fill="#ffffff" opacity="0.72" />
            </g>
          ))}
          {/* Warm Wooden Windowsill */}
          <rect x="3" y="21" width="80" height="4" fill="#0b0d14" />
          <rect x="4" y="22" width="78" height="2" fill="#d98a4e" />
          {/* Wall Power Socket on Right */}
          <rect x="85" y="21" width="7" height="5" fill="#0b0d14" />
          <rect x="86" y="22" width="5" height="3" fill="#e2e8f0" />
          <rect x="87" y="23" width="1" height="1" fill="#0f172a" />
          <rect x="89" y="23" width="1" height="1" fill="#0f172a" />
        </svg>
      );

    case 'paired-wood-desks':
      // Iconic Paired Wooden Desks + Angled Monitor + Laptop + Chart + Red & Green Swivel Chairs (Directly from Reference Image!)
      return (
        <svg viewBox="0 0 96 40" shapeRendering="crispEdges" className="w-full h-full pixelated overflow-visible">
          {/* Floor Shadows */}
          <rect x="6" y="31" width="82" height="6" fill="rgba(0,0,0,0.35)" />
          {/* Left Red Swivel Chair */}
          <rect x="9" y="27" width="2" height="5" fill="#0b0d14" />
          <rect x="5" y="30" width="10" height="2" fill="#cbd5e1" />
          <rect x="4" y="31" width="2" height="2" fill="#0b0d14" />
          <rect x="14" y="31" width="2" height="2" fill="#0b0d14" />
          <rect x="4" y="18" width="12" height="9" fill="#0b0d14" />
          <rect x="5" y="19" width="10" height="6" fill="#ef4444" />
          <rect x="5" y="24" width="10" height="1" fill="#b91c1c" />
          <rect x="2" y="11" width="4" height="11" fill="#0b0d14" />
          <rect x="3" y="12" width="2" height="9" fill="#ef4444" />

          {/* Left Wooden Desk */}
          <rect x="19" y="8" width="26" height="24" fill="#0b0d14" />
          <rect x="20" y="9" width="24" height="20" fill="#dd9b60" />
          <rect x="20" y="9" width="24" height="2" fill="#f5c99b" />
          <rect x="20" y="27" width="24" height="2" fill="#b46d35" />
          <rect x="21" y="31" width="3" height="5" fill="#0b0d14" />
          <rect x="22" y="31" width="1" height="4" fill="#a86432" />
          <rect x="40" y="31" width="3" height="5" fill="#0b0d14" />
          <rect x="41" y="31" width="1" height="4" fill="#a86432" />
          {/* Dark Keyboard + Mouse + Angled Flat Monitor */}
          <rect x="23" y="14" width="6" height="10" fill="#0b0d14" />
          <rect x="24" y="15" width="4" height="8" fill="#334155" />
          <rect x="26" y="26" width="4" height="3" fill="#0b0d14" />
          <rect x="27" y="27" width="2" height="1" fill="#475569" />
          <rect x="33" y="4" width="8" height="16" fill="#0b0d14" />
          <rect x="34" y="5" width="6" height="14" fill="#334155" />
          <rect x="34" y="5" width="2" height="14" fill="#64748b" />

          {/* Right Wooden Desk */}
          <rect x="47" y="8" width="26" height="24" fill="#0b0d14" />
          <rect x="48" y="9" width="24" height="20" fill="#dd9b60" />
          <rect x="48" y="9" width="24" height="2" fill="#f5c99b" />
          <rect x="48" y="27" width="24" height="2" fill="#b46d35" />
          <rect x="49" y="31" width="3" height="5" fill="#0b0d14" />
          <rect x="50" y="31" width="1" height="4" fill="#a86432" />
          <rect x="68" y="31" width="3" height="5" fill="#0b0d14" />
          <rect x="69" y="31" width="1" height="4" fill="#a86432" />
          {/* White Report Paper with Red/Green Chart + Laptop + Mouse */}
          <rect x="50" y="10" width="10" height="6" fill="#0b0d14" />
          <rect x="51" y="11" width="8" height="4" fill="#ffffff" />
          <rect x="52" y="12" width="5" height="1" fill="#ef4444" />
          <rect x="52" y="13" width="6" height="1" fill="#22c55e" />
          <rect x="55" y="17" width="10" height="10" fill="#0b0d14" />
          <rect x="56" y="18" width="8" height="8" fill="#475569" />
          <rect x="62" y="15" width="4" height="3" fill="#0b0d14" />

          {/* Right Bright Green Swivel Chair */}
          <rect x="81" y="27" width="2" height="5" fill="#0b0d14" />
          <rect x="77" y="30" width="10" height="2" fill="#cbd5e1" />
          <rect x="76" y="31" width="2" height="2" fill="#0b0d14" />
          <rect x="86" y="31" width="2" height="2" fill="#0b0d14" />
          <rect x="76" y="18" width="12" height="9" fill="#0b0d14" />
          <rect x="77" y="19" width="10" height="6" fill="#4ade80" />
          <rect x="77" y="24" width="10" height="1" fill="#16a34a" />
          <rect x="86" y="11" width="4" height="11" fill="#0b0d14" />
          <rect x="87" y="12" width="2" height="9" fill="#4ade80" />
        </svg>
      );

    case 'trash-bin':
      // Cylindrical Gray Office Wastebasket (Bottom-Left of Reference Image!)
      return (
        <svg viewBox="0 0 24 24" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="5" y="19" width="14" height="3" fill="rgba(0,0,0,0.4)" />
          <rect x="5" y="5" width="14" height="15" fill="#0b0d14" />
          <rect x="6" y="6" width="12" height="4" fill="#64748b" />
          <rect x="6" y="5" width="12" height="2" fill="#cbd5e1" />
          <rect x="6" y="10" width="12" height="9" fill="#94a3b8" />
          <rect x="7" y="10" width="3" height="9" fill="#cbd5e1" />
          <rect x="15" y="10" width="3" height="9" fill="#64748b" />
        </svg>
      );

    case 'swivel-chair': {
      const palette =
        prop.chairColor === 'green'
          ? { main: '#4ade80', shade: '#16a34a' }
          : prop.chairColor === 'red'
            ? { main: '#ef4444', shade: '#b91c1c' }
            : prop.chairColor === 'amber'
              ? { main: '#fbbf24', shade: '#d97706' }
              : { main: '#0ea5e9', shade: '#0284c7' };
      return (
        <svg viewBox="0 0 24 24" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="5" y="19" width="14" height="3" fill="rgba(0,0,0,0.4)" />
          <rect x="11" y="15" width="2" height="5" fill="#0b0d14" />
          <rect x="7" y="18" width="10" height="2" fill="#cbd5e1" />
          <rect x="6" y="19" width="2" height="2" fill="#0b0d14" />
          <rect x="16" y="19" width="2" height="2" fill="#0b0d14" />
          <rect x="6" y="9" width="12" height="8" fill="#0b0d14" />
          <rect x="7" y="10" width="10" height="5" fill={palette.main} />
          <rect x="7" y="14" width="10" height="2" fill={palette.shade} />
          <rect x="15" y="4" width="4" height="10" fill="#0b0d14" />
          <rect x="16" y="5" width="2" height="8" fill={palette.main} />
        </svg>
      );
    }

    case 'server-desk':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="3" y="23" width="42" height="3" fill="rgba(0,0,0,0.45)" />
          <rect x="4" y="4" width="40" height="20" fill="#0b0d14" />
          <rect x="5" y="5" width="38" height="18" fill="#1e293b" />
          <rect x="5" y="5" width="38" height="2" fill="#334155" />
          <rect x="8" y="7" width="14" height="9" fill="#090d16" />
          <rect x="9" y="8" width="12" height="7" fill="#064e3b" />
          <rect x="10" y="9" width="8" height="1" fill="#34d399" />
          <rect x="10" y="11" width="10" height="1" fill="#22d3ee" />
          <rect x="26" y="7" width="14" height="9" fill="#090d16" />
          <rect x="27" y="8" width="12" height="7" fill="#0f172a" />
          <rect x="28" y="9" width="9" height="1" fill="#38bdf8" />
          <rect x="12" y="18" width="10" height="3" fill="#090d16" />
          <rect x="28" y="18" width="10" height="3" fill="#090d16" />
        </svg>
      );

    case 'filing-cabinet':
      return (
        <svg viewBox="0 0 24 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="3" y="2" width="18" height="24" fill="#0b0d14" />
          <rect x="4" y="3" width="16" height="22" fill="#94a3b8" />
          <rect x="5" y="5" width="14" height="6" fill="#cbd5e1" />
          <rect x="10" y="7" width="4" height="2" fill="#334155" />
          <rect x="5" y="12" width="14" height="6" fill="#cbd5e1" />
          <rect x="10" y="14" width="4" height="2" fill="#334155" />
          <rect x="5" y="19" width="14" height="5" fill="#cbd5e1" />
        </svg>
      );

    case 'printer-3d':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="2" y="4" width="44" height="22" fill="#0b0d14" />
          <rect x="3" y="5" width="42" height="20" fill="#9a5f32" />
          <rect x="7" y="6" width="20" height="17" fill="#1c1917" />
          <rect x="9" y="8" width="16" height="12" fill="#292524" />
          <rect x="11" y="11" width="12" height="2" fill="#fbbf24" />
          <rect x="13" y="15" width="8" height="4" fill="#34d399" />
          <rect x="30" y="9" width="12" height="10" fill="#0f172a" />
          <rect x="32" y="11" width="8" height="2" fill="#fbbf24" />
        </svg>
      );

    case 'water-cooler':
      return (
        <svg viewBox="0 0 24 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="5" y="2" width="14" height="24" fill="#0b0d14" />
          <rect x="7" y="3" width="10" height="9" fill="#38bdf8" />
          <rect x="8" y="4" width="3" height="6" fill="#bae6fd" />
          <rect x="6" y="12" width="12" height="13" fill="#f1f5f9" />
          <rect x="8" y="15" width="3" height="2" fill="#0284c7" />
          <rect x="13" y="15" width="3" height="2" fill="#ef4444" />
        </svg>
      );

    case 'calculator-desk':
      return (
        <svg viewBox="0 0 24 24" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="3" y="3" width="18" height="18" fill="#0b0d14" />
          <rect x="4" y="4" width="16" height="16" fill="#78350f" />
          <rect x="6" y="6" width="12" height="4" fill="#064e3b" />
          <rect x="6" y="12" width="3" height="2" fill="#fde68a" />
          <rect x="10" y="12" width="3" height="2" fill="#fde68a" />
          <rect x="14" y="12" width="4" height="2" fill="#f59e0b" />
        </svg>
      );

    case 'highscore-sign':
      return (
        <svg viewBox="0 0 96 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          {/* 16-bit Poster Left */}
          <rect x="2" y="3" width="16" height="20" fill="#0b0d14" />
          <rect x="3" y="4" width="14" height="18" fill="#e11d48" />
          <rect x="5" y="7" width="10" height="6" fill="#fde047" />
          {/* HIGH SCORES Neon Board */}
          <rect x="22" y="4" width="52" height="18" fill="#0b0d14" />
          <rect x="23" y="5" width="50" height="16" fill="#0f172a" />
          <rect x="25" y="7" width="46" height="2" fill="#22d3ee" />
          <rect x="28" y="11" width="40" height="4" fill="#fbbf24" />
          <rect x="25" y="17" width="46" height="2" fill="#f43f5e" />
          {/* 16-bit Poster Right */}
          <rect x="78" y="3" width="16" height="20" fill="#0b0d14" />
          <rect x="79" y="4" width="14" height="18" fill="#4f46e5" />
          <rect x="81" y="7" width="10" height="6" fill="#38bdf8" />
        </svg>
      );

    case 'claw-machine':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="4" y="1" width="40" height="26" fill="#0b0d14" />
          <rect x="5" y="2" width="38" height="24" fill="#db2777" />
          <rect x="7" y="4" width="34" height="14" fill="#cffafe" />
          {/* Gantry & Claw */}
          <rect x="19" y="5" width="2" height="5" fill="#475569" />
          <rect x="17" y="10" width="6" height="2" fill="#334155" />
          {/* Plushies */}
          <rect x="9" y="13" width="5" height="4" fill="#fbbf24" />
          <rect x="17" y="14" width="5" height="3" fill="#a855f7" />
          <rect x="25" y="13" width="5" height="4" fill="#34d399" />
          <rect x="33" y="14" width="5" height="3" fill="#f43f5e" />
          <rect x="8" y="20" width="10" height="4" fill="#0f172a" />
        </svg>
      );

    case 'pinball-machine':
      return (
        <svg viewBox="0 0 24 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="3" y="1" width="18" height="26" fill="#0b0d14" />
          <rect x="4" y="2" width="16" height="24" fill="#312e81" />
          <rect x="5" y="3" width="14" height="5" fill="#f43f5e" />
          <rect x="6" y="9" width="12" height="14" fill="#0c4a6e" />
          <rect x="9" y="12" width="2" height="2" fill="#fde047" />
          <rect x="13" y="12" width="2" height="2" fill="#22d3ee" />
          <rect x="11" y="17" width="2" height="2" fill="#ffffff" />
        </svg>
      );

    case 'cockpit-sim':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="2" y="2" width="44" height="24" fill="#0b0d14" />
          <rect x="3" y="3" width="42" height="22" fill="#1e293b" />
          <rect x="4" y="4" width="16" height="20" fill="#0284c7" />
          <rect x="22" y="5" width="18" height="12" fill="#090d16" />
          <rect x="24" y="7" width="14" height="8" fill="#38bdf8" />
          <rect x="26" y="19" width="10" height="4" fill="#dc2626" />
        </svg>
      );

    case 'arcade-cabinet':
      return (
        <svg viewBox="0 0 24 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="3" y="1" width="18" height="26" fill="#0b0d14" />
          <rect x="4" y="2" width="16" height="24" fill="#1e1b4b" />
          <rect x="5" y="3" width="14" height="4" fill="#f43f5e" />
          <rect x="6" y="8" width="12" height="9" fill="#22d3ee" />
          <rect x="5" y="18" width="14" height="3" fill="#475569" />
        </svg>
      );

    case 'coffee-bar':
      return (
        <svg viewBox="0 0 120 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="2" y="2" width="116" height="24" fill="#0b0d14" />
          <rect x="3" y="3" width="114" height="22" fill="#9a5628" />
          <rect x="3" y="3" width="114" height="4" fill="#c77d46" />
          {/* Espresso Machine */}
          <rect x="8" y="6" width="18" height="14" fill="#0b0d14" />
          <rect x="9" y="7" width="16" height="12" fill="#cbd5e1" />
          <rect x="11" y="13" width="5" height="4" fill="#78350f" />
          <rect x="18" y="13" width="5" height="4" fill="#78350f" />
          {/* Glass Pastry Display */}
          <rect x="32" y="6" width="24" height="14" fill="#0b0d14" />
          <rect x="33" y="7" width="22" height="12" fill="#cffafe" />
          <rect x="36" y="10" width="5" height="3" fill="#f59e0b" />
          <rect x="44" y="10" width="5" height="3" fill="#fb7185" />
          <rect x="36" y="15" width="6" height="3" fill="#d97706" />
          {/* Bar Stools */}
          {[76, 92, 108].map((sx, idx) => (
            <g key={idx}>
              <rect x={sx - 5} y="16" width="10" height="9" fill="#0b0d14" />
              <rect x={sx - 4} y="17" width="8" height="7" fill="#fbbf24" />
            </g>
          ))}
        </svg>
      );

    case 'cafe-table':
      return (
        <svg viewBox="0 0 48 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          {/* Left Chair */}
          <rect x="4" y="9" width="8" height="10" fill="#0b0d14" />
          <rect x="5" y="10" width="6" height="8" fill="#b45309" />
          {/* Round Table */}
          <rect x="15" y="4" width="18" height="18" fill="#0b0d14" />
          <rect x="16" y="5" width="16" height="16" fill="#dd9b60" />
          <rect x="21" y="10" width="5" height="5" fill="#ffffff" />
          <rect x="22" y="11" width="3" height="3" fill="#78350f" />
          {/* Right Chair */}
          <rect x="36" y="9" width="8" height="10" fill="#0b0d14" />
          <rect x="37" y="10" width="6" height="8" fill="#b45309" />
        </svg>
      );

    case 'sofa':
      return (
        <svg viewBox="0 0 96 28" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="4" y="3" width="88" height="22" fill="#0b0d14" />
          <rect x="5" y="4" width="86" height="20" fill="#4338ca" />
          <rect x="6" y="5" width="84" height="5" fill="#312e81" />
          <rect x="12" y="11" width="22" height="11" fill="#6366f1" />
          <rect x="37" y="11" width="22" height="11" fill="#6366f1" />
          <rect x="62" y="11" width="22" height="11" fill="#6366f1" />
        </svg>
      );

    case 'plant':
      return (
        <svg viewBox="0 0 20 20" shapeRendering="crispEdges" className="w-full h-full pixelated">
          <rect x="5" y="12" width="10" height="7" fill="#0b0d14" />
          <rect x="6" y="13" width="8" height="5" fill="#b45309" />
          <rect x="5" y="11" width="10" height="2" fill="#d97706" />
          <rect x="6" y="4" width="8" height="7" fill="#16a34a" />
          <rect x="3" y="6" width="4" height="4" fill="#22c55e" />
          <rect x="13" y="6" width="4" height="4" fill="#22c55e" />
          <rect x="8" y="2" width="4" height="4" fill="#4ade80" />
        </svg>
      );
  }
};
