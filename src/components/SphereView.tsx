import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Eye,
  ExternalLink,
  Edit2,
  Plus,
  Compass,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { ACCENT_COLOR_MAP, WebAppItem } from '../types/launcher';
import {
  generateHexSpiralCoordinates,
  projectSphericalBubble,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface SphereViewProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  onPrimaryAppClick: (app: WebAppItem) => void;
  onOpenLivePreview: (app: WebAppItem) => void;
  onOpenEditModal: (app: WebAppItem) => void;
  onOpenNewAppAtSlot: (slotIndex: number) => void;
}

type SphereNode =
  | { type: 'clock'; id: string }
  | { type: 'app'; id: string; app: WebAppItem }
  | { type: 'empty_slot'; id: string; slotIndex: number };

export const SphereView: React.FC<SphereViewProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  onPrimaryAppClick,
  onOpenLivePreview,
  onOpenEditModal,
  onOpenNewAppAtSlot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 960, height: 640 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showAllSlotsInSphere, setShowAllSlotsInSphere] = useState(true);
  const [focusedAppId, setFocusedAppId] = useState<string | null>(
    apps[0]?.id || null
  );
  const [now, setNow] = useState(() => new Date());

  // Dragging state
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Live clock tick for the center watchOS clock node
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Measure container viewport dynamically so sphere never overflows
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Build the spherical honeycomb nodes:
  // Index 0 = Center WatchOS Live Clock (just like the reference image)
  // Ring 1 & Ring 2 = User's registered apps first (so all apps are immediately prominent around the center),
  // followed by interactive quick-add slot bubbles to form a complete 19-bubble or 37-bubble watchOS sphere.
  const sphereNodes = useMemo<SphereNode[]>(() => {
    const sortedApps = [...apps].sort((a, b) => a.slotIndex - b.slotIndex);
    const occupiedSlots = new Set(sortedApps.map((a) => a.slotIndex));
    const nodes: SphereNode[] = [{ type: 'clock', id: 'watchos-center-clock' }];

    for (const app of sortedApps) {
      nodes.push({ type: 'app', id: app.id, app });
    }

    if (showAllSlotsInSphere) {
      // Fill up to 19 nodes (Center + Ring 1 (6) + Ring 2 (12)) or 37 nodes if more apps exist
      const targetCount = sortedApps.length > 18 ? 37 : 19;
      for (
        let slotIdx = 0;
        slotIdx < 40 && nodes.length < targetCount;
        slotIdx++
      ) {
        if (!occupiedSlots.has(slotIdx)) {
          nodes.push({
            type: 'empty_slot',
            id: `sphere-slot-${slotIdx}`,
            slotIndex: slotIdx,
          });
        }
      }
    }

    return nodes;
  }, [apps, showAllSlotsInSphere]);

  // Responsive spacing and sphere radius based on current viewport
  const minDim = Math.min(viewportSize.width, viewportSize.height);
  const bubbleSpacing = Math.max(66, Math.min(104, minDim * 0.165));
  const sphereRadius = Math.max(145, Math.min(340, minDim * 0.43));

  const hexCoords = useMemo(
    () => generateHexSpiralCoordinates(sphereNodes.length, bubbleSpacing),
    [sphereNodes.length, bubbleSpacing]
  );

  // Pointer drag handlers for smooth 360° spherical panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-sphere-hud="true"]')) return;
    isDraggingRef.current = true;
    didMoveRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 5) {
      didMoveRef.current = true;
    }
    const maxPan = bubbleSpacing * 2.6;
    const nextX = Math.max(
      -maxPan,
      Math.min(maxPan, dragStartRef.current.panX + dx / zoom)
    );
    const nextY = Math.max(
      -maxPan,
      Math.min(maxPan, dragStartRef.current.panY + dy / zoom)
    );
    setPan({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) =>
      Math.max(0.75, Math.min(1.45, Number((prev + delta).toFixed(2))))
    );
  };

  const centerOnCoord = (worldX: number, worldY: number) => {
    setPan({ x: -worldX, y: -worldY });
  };

  const focusedApp =
    apps.find((a) => a.id === focusedAppId) || apps[0] || null;

  // Calculate clock hands angles
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  return (
    <main
      ref={containerRef}
      data-testid="sphere-view"
      aria-label="Visualização em esfera dos aplicativos"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className="relative z-10 flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      {/* Subtle 3D Spherical Lens Backdrop & Concentric Horizon Rings */}
      <div
        style={{
          width: `${sphereRadius * 2.08}px`,
          height: `${sphereRadius * 2.08}px`,
        }}
        className="relative flex items-center justify-center rounded-full pointer-events-none transition-all duration-200"
      >
        <div className="absolute inset-0 rounded-full bg-radial from-indigo-500/12 via-slate-900/40 to-transparent border border-white/[0.07] shadow-[inset_0_0_80px_rgba(99,102,241,0.12)]" />
        <div className="absolute inset-[16%] rounded-full border border-dashed border-white/[0.05]" />
      </div>

      {/* Spherical Honeycomb Bubbles Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {sphereNodes.map((node, idx) => {
          const coord = hexCoords[idx];
          if (!coord) return null;

          const proj = projectSphericalBubble(
            coord.x,
            coord.y,
            pan.x,
            pan.y,
            sphereRadius,
            zoom
          );

          const bubbleBaseSize = Math.max(54, Math.min(78, minDim * 0.115));

          if (node.type === 'clock') {
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  if (didMoveRef.current) return;
                  centerOnCoord(0, 0);
                }}
                aria-label="Relógio Central — Centralizar Esfera"
                title="Relógio Central WatchOS (Clique para centralizar a esfera)"
                style={{
                  transform: `translate3d(${proj.screenX}px, ${proj.screenY}px, 0) scale(${proj.scale})`,
                  opacity: proj.opacity,
                  zIndex: proj.zIndex,
                  width: `${bubbleBaseSize}px`,
                  height: `${bubbleBaseSize}px`,
                }}
                className="pointer-events-auto absolute rounded-full bg-white text-slate-950 shadow-[0_12px_32px_rgba(0,0,0,0.65)] border-2 border-white/80 flex items-center justify-center transition-transform duration-150 ease-out cursor-pointer group"
              >
                {/* WatchOS Analog Clock Dial */}
                <div className="relative w-full h-full rounded-full flex items-center justify-center">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                    (deg) => (
                      <span
                        key={deg}
                        style={{
                          transform: `rotate(${deg}deg) translateY(-${
                            bubbleBaseSize * 0.39
                          }px)`,
                        }}
                        className={`absolute w-0.5 ${
                          deg % 90 === 0
                            ? 'h-1.5 bg-slate-900'
                            : 'h-1 bg-slate-400'
                        } rounded-full`}
                      />
                    )
                  )}
                  {/* Hour Hand */}
                  <span
                    style={{
                      transform: `rotate(${hours * 30}deg)`,
                      height: `${bubbleBaseSize * 0.24}px`,
                      marginTop: `-${bubbleBaseSize * 0.24}px`,
                    }}
                    className="absolute w-1 bg-slate-900 rounded-full origin-bottom"
                  />
                  {/* Minute Hand */}
                  <span
                    style={{
                      transform: `rotate(${minutes * 6}deg)`,
                      height: `${bubbleBaseSize * 0.34}px`,
                      marginTop: `-${bubbleBaseSize * 0.34}px`,
                    }}
                    className="absolute w-0.5 bg-slate-900 rounded-full origin-bottom"
                  />
                  {/* Orange WatchOS Second Hand */}
                  <span
                    style={{
                      transform: `rotate(${seconds * 6}deg)`,
                      height: `${bubbleBaseSize * 0.38}px`,
                      marginTop: `-${bubbleBaseSize * 0.38}px`,
                    }}
                    className="absolute w-[1.5px] bg-amber-500 rounded-full origin-bottom"
                  />
                  <span className="w-2 h-2 rounded-full bg-amber-500 border border-slate-900 z-10" />
                </div>
              </button>
            );
          }

          if (node.type === 'app') {
            const { app } = node;
            const isMatched = matchingAppIds.has(app.id);
            const isDimmed = hasActiveFilter && !isMatched;
            const isFocused = focusedApp?.id === app.id;
            const accent =
              ACCENT_COLOR_MAP[app.accentColor] || ACCENT_COLOR_MAP.indigo;

            return (
              <div
                key={node.id}
                style={{
                  transform: `translate3d(${proj.screenX}px, ${proj.screenY}px, 0) scale(${proj.scale})`,
                  opacity: isDimmed ? proj.opacity * 0.25 : proj.opacity,
                  zIndex: isFocused ? proj.zIndex + 30 : proj.zIndex,
                }}
                className="pointer-events-auto absolute flex flex-col items-center justify-center transition-transform duration-150 ease-out group"
              >
                <button
                  type="button"
                  data-testid={`sphere-app-${app.id}`}
                  aria-label={`Esfera: ${app.name}`}
                  onClick={() => {
                    if (didMoveRef.current) return;
                    setFocusedAppId(app.id);
                    // If bubble is already near the center of the sphere, launch it; otherwise glide it to center AND select it
                    if (proj.normalizedDist < 0.38) {
                      onPrimaryAppClick(app);
                    } else {
                      centerOnCoord(coord.x, coord.y);
                      onPrimaryAppClick(app);
                    }
                  }}
                  style={{
                    width: `${bubbleBaseSize}px`,
                    height: `${bubbleBaseSize}px`,
                  }}
                  className={`relative rounded-full flex items-center justify-center shadow-[0_14px_34px_rgba(0,0,0,0.65)] transition-all cursor-pointer ${
                    isFocused
                      ? 'ring-2 ring-white/80 scale-105'
                      : 'hover:ring-2 hover:ring-white/50'
                  }`}
                >
                  {/* Full Circular WatchOS Orb with AppLogo */}
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${accent.bgGradient} p-0.5 flex items-center justify-center shadow-inner overflow-hidden`}
                  >
                    <AppLogo
                      name={app.name}
                      url={app.url}
                      accentColor={app.accentColor}
                      customLogoUrl={app.customLogoUrl}
                      size="md"
                      shape="circle"
                    />
                  </div>
                </button>

                {/* Crisp Floating App Label below magnified central/mid bubbles */}
                {proj.scale > 0.68 && (
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white whitespace-nowrap shadow-md pointer-events-none">
                    {app.name}
                  </span>
                )}
              </div>
            );
          }

          // Empty Slot Bubble in Honeycomb Sphere
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => {
                if (didMoveRef.current) return;
                onOpenNewAppAtSlot(node.slotIndex);
              }}
              aria-label={`Adicionar App na Esfera (Slot ${node.slotIndex})`}
              title={`Slot #${String(node.slotIndex).padStart(
                2,
                '0'
              )} livre — Clique para adicionar um Web App`}
              style={{
                transform: `translate3d(${proj.screenX}px, ${proj.screenY}px, 0) scale(${proj.scale})`,
                opacity: proj.opacity * 0.85,
                zIndex: proj.zIndex,
                width: `${bubbleBaseSize * 0.84}px`,
                height: `${bubbleBaseSize * 0.84}px`,
              }}
              className="pointer-events-auto absolute rounded-full bg-slate-900/65 hover:bg-indigo-500/25 border border-dashed border-white/20 hover:border-indigo-400/60 backdrop-blur-md flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-white shadow-lg transition-all duration-150 cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-mono tabular-nums">
                #{String(node.slotIndex).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Floating WatchOS / Sonoma Sphere Control Dock */}
      <div
        data-sphere-hud="true"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[95vw] rounded-2xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 shadow-2xl px-3 py-1.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      >
        {focusedApp && (
          <div className="flex items-center gap-2 pr-2 border-r border-white/10">
            <span className="text-xs font-semibold text-white truncate max-w-[110px] sm:max-w-[150px]">
              {focusedApp.name}
            </span>
            <button
              type="button"
              onClick={() => onOpenLivePreview(focusedApp)}
              aria-label={`Preview de ${focusedApp.name}`}
              title="Visualizar na Tela"
              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-200 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <a
              href={focusedApp.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Nova aba ${focusedApp.name}`}
              title="Abrir em Nova Aba"
              className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onOpenEditModal(focusedApp)}
              aria-label={`Editar ${focusedApp.name}`}
              title="Editar App"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sphere Zoom & Recenter Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.max(0.75, Number((z - 0.12).toFixed(2))))
            }
            aria-label="Diminuir zoom da esfera"
            title="Diminuir Zoom da Esfera"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 tabular-nums px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => Math.min(1.45, Number((z + 0.12).toFixed(2))))
            }
            aria-label="Aumentar zoom da esfera"
            title="Aumentar Zoom da Esfera"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPan({ x: 0, y: 0 });
              setZoom(1);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Compass className="w-3 h-3 text-indigo-300" />
            <span>Centralizar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAllSlotsInSphere((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              showAllSlotsInSphere
                ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{showAllSlotsInSphere ? 'Colmeia Completa' : 'Só Apps'}</span>
          </button>
        </div>
      </div>
    </main>
  );
};
