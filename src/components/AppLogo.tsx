import React, { useState, useEffect } from 'react';
import { ACCENT_COLOR_MAP, AccentColor } from '../types/launcher';
import { getAppInitials, getFaviconSources } from '../utils/launcherLogic';

interface AppLogoProps {
  name: string;
  url: string;
  accentColor: AccentColor;
  customLogoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'squircle' | 'circle';
  forceMonogram?: boolean;
  onSourceResolved?: (source: 'custom' | 'google' | 'duckduckgo' | 'monogram') => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  name,
  url,
  accentColor,
  customLogoUrl,
  size = 'md',
  shape = 'squircle',
  forceMonogram = false,
  onSourceResolved,
}) => {
  const sources = getFaviconSources(url, customLogoUrl);
  const initials = getAppInitials(name);
  const colorStyle = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.indigo;

  // Stage index: 0 = custom, 1 = google primary, 2 = duckduckgo secondary, 3 = monogram fallback
  const getInitialStage = (): 0 | 1 | 2 | 3 => {
    if (forceMonogram || customLogoUrl === 'monogram://fallback') return 3;
    if (sources.custom) return 0;
    if (sources.primary) return 1;
    return 3;
  };

  const [stage, setStage] = useState<0 | 1 | 2 | 3>(getInitialStage);

  useEffect(() => {
    const nextStage = getInitialStage();
    setStage(nextStage);
  }, [url, customLogoUrl, forceMonogram]);

  useEffect(() => {
    if (!onSourceResolved) return;
    const map: Record<0 | 1 | 2 | 3, 'custom' | 'google' | 'duckduckgo' | 'monogram'> = {
      0: 'custom',
      1: 'google',
      2: 'duckduckgo',
      3: 'monogram',
    };
    onSourceResolved(map[stage]);
  }, [stage, onSourceResolved]);

  const handleImageError = () => {
    if (stage === 0) {
      if (sources.primary) {
        setStage(1);
      } else {
        setStage(3);
      }
    } else if (stage === 1) {
      if (sources.secondary) {
        setStage(2);
      } else {
        setStage(3);
      }
    } else {
      setStage(3);
    }
  };

  const currentImgSrc =
    stage === 0
      ? sources.custom
      : stage === 1
        ? sources.primary
        : stage === 2
          ? sources.secondary
          : null;

  const radiusClass =
    shape === 'circle'
      ? 'rounded-full'
      : size === 'xs' || size === 'sm'
        ? 'rounded-xl'
        : 'rounded-2xl';

  const dimensions =
    size === 'xs'
      ? `w-10 h-10 sm:w-11 sm:h-11 ${radiusClass} text-xs`
      : size === 'sm'
        ? `w-11 h-11 sm:w-12 sm:h-12 ${radiusClass} text-sm`
        : size === 'lg'
          ? `w-16 h-16 sm:w-20 sm:h-20 ${radiusClass} text-2xl`
          : `w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 ${radiusClass} text-lg`;

  const imgDimensions =
    size === 'xs'
      ? 'w-5 h-5 sm:w-6 sm:h-6'
      : size === 'sm'
        ? 'w-6 h-6 sm:w-7 sm:h-7'
        : size === 'lg'
          ? 'w-9 h-9 sm:w-11 sm:h-11'
          : 'w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9';

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none transition-all duration-200 border border-white/15 bg-slate-900/80 backdrop-blur-xl shadow-lg ${colorStyle.iconGlow} ${colorStyle.borderHover} ${dimensions} overflow-hidden`}
    >
      {/* Ambient accent glow inside the icon */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colorStyle.bgGradient} ${
          shape === 'circle' ? 'opacity-35' : 'opacity-20'
        } group-hover:opacity-45 transition-opacity pointer-events-none`}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {currentImgSrc && stage !== 3 ? (
        <img
          src={currentImgSrc}
          alt={`${name || 'App'} logo`}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className={`relative z-10 ${imgDimensions} object-contain ${
            shape === 'circle' ? 'rounded-full' : 'rounded-lg'
          } drop-shadow-sm transition-transform duration-200 group-hover:scale-105`}
        />
      ) : (
        <div
          className={`relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br ${colorStyle.bgGradient} text-white font-display font-bold tracking-tight`}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
