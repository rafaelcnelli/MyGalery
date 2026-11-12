import React, { useState, useEffect } from 'react';
import { ACCENT_COLOR_MAP, AccentColor } from '../types/launcher';
import {
  FaviconSourceType,
  getAppInitials,
  getFaviconSources,
} from '../utils/launcherLogic';

interface AppLogoProps {
  name: string;
  url: string;
  accentColor: AccentColor;
  customLogoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'squircle' | 'circle';
  forceMonogram?: boolean;
  onSourceResolved?: (source: FaviconSourceType) => void;
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

  const isMonogramForced =
    forceMonogram ||
    customLogoUrl === 'monogram://fallback' ||
    sources.candidates.length === 0;

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [exhausted, setExhausted] = useState<boolean>(isMonogramForced);

  useEffect(() => {
    setCandidateIndex(0);
    setExhausted(
      forceMonogram ||
        customLogoUrl === 'monogram://fallback' ||
        sources.candidates.length === 0
    );
  }, [url, customLogoUrl, forceMonogram, sources.candidates.length]);

  const activeCandidate =
    !exhausted && candidateIndex < sources.candidates.length
      ? sources.candidates[candidateIndex]
      : null;

  useEffect(() => {
    if (!onSourceResolved) return;
    if (!activeCandidate) {
      onSourceResolved('monogram');
    } else {
      onSourceResolved(activeCandidate.source);
    }
  }, [activeCandidate, onSourceResolved]);

  const advanceToNextCandidate = () => {
    setCandidateIndex((prev) => {
      const next = prev + 1;
      if (next >= sources.candidates.length) {
        setExhausted(true);
        return prev;
      }
      return next;
    });
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // When Google S2 doesn't know a domain yet, it returns a generic 16x16 globe icon even when sz=128 is requested
    if (
      activeCandidate?.source === 'google' &&
      img.naturalWidth > 0 &&
      img.naturalWidth <= 16 &&
      img.naturalHeight <= 16
    ) {
      advanceToNextCandidate();
    }
  };

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

      {activeCandidate ? (
        <img
          key={activeCandidate.url}
          src={activeCandidate.url}
          alt={`${name} icon`}
          onLoad={handleImageLoad}
          onError={advanceToNextCandidate}
          className={`relative z-10 ${imgDimensions} object-contain rounded-lg drop-shadow-md transition-transform duration-200 group-hover:scale-105`}
          loading="lazy"
        />
      ) : (
        <div
          className={`relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br ${colorStyle.bgGradient} font-display font-bold tracking-tight text-white`}
        >
          <span className="drop-shadow-sm">{initials}</span>
        </div>
      )}
    </div>
  );
};
