import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Plus, Compass } from 'lucide-react';
import { WebAppItem, CATEGORY_COLORS } from '../types/launcher';
import {
  formatSlotNumber,
  sortAppsWithMagneticFilter,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface SphereViewProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  onSelectApp: (app: WebAppItem, e?: React.MouseEvent) => void;
  onDoubleClickApp?: (app: WebAppItem) => void;
  onOpenExternal?: (app: WebAppItem) => void;
  onContextMenuApp?: (app: WebAppItem, e: React.MouseEvent) => void;
  onAddClick: () => void;
}

export const SphereView: React.FC<SphereViewProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  onSelectApp,
  onDoubleClickApp,
  onOpenExternal,
  onContextMenuApp,
  onAddClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const movedDistanceRef = useRef(0);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const recenterSphere = useCallback(() => {
    setPan({ x: 0, y: 0 });
  }, []);

  // Space / Home shortcut to recenter the sphere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space' || e.key === 'Home') {
        e.preventDefault();
        recenterSphere();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recenterSphere]);

  // Magnetic Filter Attraction: pulls matching apps to inner rings closest to center clock
  const orderedApps = useMemo(
    () => sortAppsWithMagneticFilter(apps, matchingAppIds, hasActiveFilter),
    [apps, matchingAppIds, hasActiveFilter]
  );

  // Compute concentric hexagonal / radial coordinates around (0,0)
  const positionedNodes = useMemo(() => {
    const ringCapacities = [6, 12, 18, 24];
    const ringRadii = [132, 230, 325, 420];
    const result: {
      app: WebAppItem;
      x: number;
      y: number;
      ringIndex: number;
    }[] = [];

    let appCursor = 0;
    for (let r = 0; r < ringCapacities.length; r++) {
      const cap = ringCapacities[r];
      const radius = ringRadii[r];
      const remaining = orderedApps.length - appCursor;
      if (remaining <= 0) break;
      const countInRing = Math.min(cap, remaining);
      for (let i = 0; i < countInRing; i++) {
        const angle = (i / countInRing) * Math.PI * 2 - Math.PI / 2;
        result.push({
          app: orderedApps[appCursor],
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          ringIndex: r,
        });
        appCursor++;
      }
    }
    return result;
  }, [orderedApps]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    movedDistanceRef.current = 0;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: pan.x, y: pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    movedDistanceRef.current = Math.hypot(dx, dy);
    const maxPan = 290;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const timeString = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateString = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  const isOffCenter = Math.hypot(pan.x, pan.y) > 8;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full overflow-hidden flex items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Orbital Rings Background */}
      <div
        className="relative flex items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
        }}
      >
        {[132, 230, 325].map((radius) => (
          <div
            key={radius}
            style={{ width: radius * 2, height: radius * 2 }}
            className="absolute rounded-full border border-white/[0.06] pointer-events-none"
          />
        ))}

        {/* Center WatchOS Live Clock Core */}
        <div className="relative z-20 w-36 h-36 rounded-full bg-zinc-950/90 border border-white/15 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center p-3 pointer-events-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
            {dateString}
          </span>
          <span className="text-2xl font-display font-bold text-white tracking-tight mt-0.5">
            {timeString}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
            {apps.length}/40 slots
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600/25 hover:bg-indigo-600 text-[10px] font-medium text-indigo-200 hover:text-white border border-indigo-500/35 transition-colors"
          >
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>

        {/* Spherical App Nodes with Fisheye Scale Effect */}
        {positionedNodes.map(({ app, x, y }) => {
          const effX = x + pan.x;
          const effY = y + pan.y;
          const distFromViewportCenter = Math.hypot(effX, effY);
          const scale = Math.max(
            0.68,
            Math.min(1.12, 1.14 - distFromViewportCenter / 900)
          );

          const isMatched = matchingAppIds.has(app.id);
          const isDimmed = hasActiveFilter && !isMatched;
          const catColor = CATEGORY_COLORS[app.category] || '#6366f1';
          const slotNum = formatSlotNumber(app.slotIndex);

          return (
            <div
              key={app.id}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (movedDistanceRef.current > 8) return;
                onSelectApp(app, e);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onDoubleClickApp) onDoubleClickApp(app);
              }}
              onAuxClick={(e) => {
                if (e.button === 1 && onOpenExternal) {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenExternal(app);
                }
              }}
              onContextMenu={(e) => {
                if (onContextMenuApp) {
                  e.preventDefault();
                  e.stopPropagation();
                  onContextMenuApp(app, e);
                }
              }}
              className={`group absolute z-20 flex flex-col items-center cursor-pointer transition-opacity duration-200 ${
                isDimmed ? 'opacity-20 grayscale' : 'opacity-100'
              }`}
            >
              <div
                className={`relative rounded-full p-1 transition-transform duration-150 group-hover:scale-110 ${
                  hasActiveFilter && isMatched
                    ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                    : ''
                }`}
              >
                <AppLogo
                  name={app.name}
                  url={app.url}
                  accentColor={app.accentColor}
                  customLogoUrl={app.customLogoUrl}
                  size="md"
                  shape="circle"
                />

                {/* Slot Badge */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-zinc-950/95 border border-white/15 text-[9px] font-mono text-zinc-300 shadow">
                  #{slotNum}
                </span>

                {/* External Only Badge */}
                {app.openExternalOnly && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[9px] font-bold shadow"
                    title="Sempre abre em Nova Aba"
                  >
                    ↗
                  </span>
                )}

                {/* Category Indicator Dot */}
                <span
                  className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full border border-zinc-950"
                  style={{ backgroundColor: catColor }}
                />
              </div>

              <span className="mt-2 px-2 py-0.5 rounded-md bg-zinc-950/85 border border-white/10 text-[11px] font-medium text-zinc-100 whitespace-nowrap shadow-md">
                {app.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Recenter Button ("Centralizar (Espaço / Home)") */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
        {hasActiveFilter && (
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/90 border border-indigo-500/40 text-xs text-indigo-200 backdrop-blur-md shadow-lg">
            Atração Magnética Ativa ({matchingAppIds.size} apps no centro)
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            recenterSphere();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-xl shadow-lg transition-all ${
            isOffCenter
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50'
              : 'bg-zinc-950/85 hover:bg-zinc-900 text-zinc-300 border-white/15'
          }`}
          title="Centralizar câmera na Esfera (Atalho: Espaço ou Home)"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Centralizar (Espaço / Home)</span>
        </button>
      </div>
    </div>
  );
};
