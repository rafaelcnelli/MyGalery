import React, { useState } from 'react';
import {
  Eye,
  ExternalLink,
  Edit2,
  Plus,
  ArrowLeftRight,
  Move,
} from 'lucide-react';
import {
  GridColumnsPerRow,
  GridScale,
  WebAppItem,
} from '../types/launcher';
import { computeSinglePageGridMetrics } from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface DesktopGridProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  isOrganizeMode: boolean;
  gridColumns: GridColumnsPerRow;
  gridScale: GridScale;
  onPrimaryAppClick: (app: WebAppItem) => void;
  onOpenLivePreview: (app: WebAppItem) => void;
  onOpenEditModal: (app: WebAppItem) => void;
  onOpenNewAppAtSlot: (slotIndex: number) => void;
  onMoveOrSwapSlot: (appId: string, targetSlotIndex: number) => void;
}

export const DesktopGrid: React.FC<DesktopGridProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  isOrganizeMode,
  gridColumns,
  gridScale,
  onPrimaryAppClick,
  onOpenLivePreview,
  onOpenEditModal,
  onOpenNewAppAtSlot,
  onMoveOrSwapSlot,
}) => {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [selectedForMoveAppId, setSelectedForMoveAppId] = useState<string | null>(
    null
  );
  const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  React.useEffect(() => {
    const onResize = () => {
      setIsNarrowScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Build O(1) lookup map from slotIndex to WebAppItem
  const slotMap = new Map<number, WebAppItem>();
  for (const app of apps) {
    slotMap.set(app.slotIndex, app);
  }

  // On narrow/mobile screens (<640px), cap columns at 4 per row so 4 apps per row fit cleanly
  const effectiveCols = (
    isNarrowScreen && gridColumns > 4 ? 4 : gridColumns
  ) as GridColumnsPerRow;

  const { columns, rows, visibleSlotCount } = computeSinglePageGridMetrics(
    effectiveCols,
    apps
  );

  const isDraggingAny = draggedAppId !== null || selectedForMoveAppId !== null;
  const showEmptySlotGuides = isOrganizeMode || isDraggingAny;
  const logoSize: 'xs' | 'sm' | 'md' =
    gridScale === 'xs' || rows > 6 || (isNarrowScreen && effectiveCols >= 4)
      ? 'xs'
      : gridScale === 'compact' || rows >= 5
        ? 'sm'
        : 'md';

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    app: WebAppItem
  ) => {
    setDraggedAppId(app.id);
    e.dataTransfer.setData('text/plain', app.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    slotIndex: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== slotIndex) {
      setDragOverSlot(slotIndex);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetSlotIndex: number
  ) => {
    e.preventDefault();
    const sourceAppId =
      draggedAppId || e.dataTransfer.getData('text/plain');
    setDraggedAppId(null);
    setDragOverSlot(null);

    if (sourceAppId) {
      onMoveOrSwapSlot(sourceAppId, targetSlotIndex);
    }
  };

  const handleSlotActionInOrganize = (
    slotIndex: number,
    occupant: WebAppItem | undefined
  ) => {
    if (selectedForMoveAppId) {
      if (selectedForMoveAppId !== occupant?.id) {
        onMoveOrSwapSlot(selectedForMoveAppId, slotIndex);
      }
      setSelectedForMoveAppId(null);
      return;
    }

    if (occupant) {
      setSelectedForMoveAppId(occupant.id);
    } else {
      onOpenNewAppAtSlot(slotIndex);
    }
  };

  return (
    <main
      aria-label="Área de trabalho de aplicativos"
      className="relative z-10 flex-1 w-full h-full min-h-0 overflow-hidden px-2.5 sm:px-5 pb-2.5 pt-1 flex flex-col"
    >
      {/* Organize / Move Helper Banner */}
      {(isOrganizeMode || selectedForMoveAppId) && (
        <div className="w-full max-w-[1600px] mx-auto mb-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-400/25 backdrop-blur-md flex items-center justify-between gap-2 text-[11px] text-amber-200 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Move className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">
              {selectedForMoveAppId
                ? 'App selecionado! Toque em qualquer slot vazio para mover ou em outro app para trocar (Auto-Swap).'
                : 'Modo Organização: Arraste ícones, toque para trocar de lugar, ou clique em um slot vazio (+) para criar.'}
            </span>
          </div>
          {selectedForMoveAppId && (
            <button
              type="button"
              onClick={() => setSelectedForMoveAppId(null)}
              className="px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 font-medium whitespace-nowrap cursor-pointer shrink-0"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Single-Page Zero-Scroll Coordinate Matrix */}
      <div
        data-testid="desktop-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
        className="w-full max-w-[1600px] mx-auto flex-1 min-h-0 overflow-hidden grid gap-1.5 sm:gap-2.5"
      >
        {Array.from({ length: visibleSlotCount }, (_, slotIndex) => {
          const occupant = slotMap.get(slotIndex);
          const isDropTarget = dragOverSlot === slotIndex;
          const isBeingDragged = occupant && draggedAppId === occupant.id;
          const isSelectedForMove =
            occupant && selectedForMoveAppId === occupant.id;
          const isMatched = occupant
            ? matchingAppIds.has(occupant.id)
            : false;
          const isDimmed = hasActiveFilter && occupant && !isMatched;

          return (
            <div
              key={slotIndex}
              data-slot-index={slotIndex}
              onDragOver={(e) => handleDragOver(e, slotIndex)}
              onDragLeave={() => {
                if (dragOverSlot === slotIndex) setDragOverSlot(null);
              }}
              onDrop={(e) => handleDrop(e, slotIndex)}
              className={`relative group/slot min-h-0 min-w-0 rounded-2xl transition-all duration-200 flex items-center justify-center p-1 ${
                occupant
                  ? isDropTarget
                    ? 'bg-indigo-500/20 border-2 border-dashed border-indigo-400 scale-[1.02]'
                    : isSelectedForMove
                      ? 'bg-amber-500/15 border-2 border-amber-400/60'
                      : 'border border-transparent'
                  : isDropTarget
                    ? 'border-2 border-dashed border-indigo-400 bg-indigo-500/15 scale-[1.02]'
                    : showEmptySlotGuides
                      ? 'border border-dashed border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      : 'border border-transparent hover:border-dashed hover:border-white/15 hover:bg-white/[0.03]'
              }`}
            >
              {/* Occupied Slot -> Render macOS/iOS App Card */}
              {occupant ? (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, occupant)}
                  onDragEnd={handleDragEnd}
                  data-testid={`app-card-${occupant.id}`}
                  className={`group relative w-full h-full min-h-0 rounded-2xl p-1 flex flex-col items-center justify-center transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'
                  } ${
                    isDimmed
                      ? 'opacity-25 scale-95 grayscale pointer-events-none'
                      : hasActiveFilter && isMatched
                        ? 'ring-1 ring-indigo-400/50 bg-indigo-500/10'
                        : 'hover:bg-white/[0.06]'
                  }`}
                >
                  {/* Slot Index Coordinate Indicator (visible in Organize Mode or Dragging) */}
                  {showEmptySlotGuides && (
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-400 tabular-nums select-none">
                      #{String(slotIndex).padStart(2, '0')}
                    </span>
                  )}

                  {/* Auto-Swap Indicator Overlay */}
                  {isDropTarget && draggedAppId !== occupant.id && (
                    <div className="absolute inset-0 z-30 rounded-2xl bg-indigo-950/85 backdrop-blur-md border border-indigo-400 flex flex-col items-center justify-center gap-0.5 text-indigo-200 pointer-events-none">
                      <ArrowLeftRight className="w-4 h-4 text-indigo-300 animate-pulse" />
                      <span className="text-[10px] font-semibold">
                        Trocar
                      </span>
                    </div>
                  )}

                  {/* Floating Quick Action Menu on Hover */}
                  <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 bg-slate-950/90 backdrop-blur-xl border border-white/15 rounded-xl p-0.5 shadow-xl">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLivePreview(occupant);
                      }}
                      aria-label={`Visualizar ${occupant.name} na tela`}
                      title="Visualizar na Tela (Live Preview)"
                      className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-indigo-500/30 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                    </button>

                    <a
                      href={occupant.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Abrir ${occupant.name} em nova aba`}
                      title="Abrir em Nova Aba"
                      className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-500/30 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(occupant);
                      }}
                      aria-label={`Editar ${occupant.name}`}
                      title="Editar ou Excluir App"
                      className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Main Clickable App Icon & Title */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isOrganizeMode || selectedForMoveAppId) {
                        handleSlotActionInOrganize(slotIndex, occupant);
                      } else {
                        onPrimaryAppClick(occupant);
                      }
                    }}
                    aria-label={`Abrir ${occupant.name}`}
                    className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 w-full h-full min-h-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl cursor-pointer"
                  >
                    <AppLogo
                      name={occupant.name}
                      url={occupant.url}
                      accentColor={occupant.accentColor}
                      customLogoUrl={occupant.customLogoUrl}
                      size={logoSize}
                    />

                    <div className="w-full text-center px-0.5 min-w-0">
                      <div className="text-[11px] sm:text-xs font-medium text-slate-100 group-hover:text-white truncate leading-tight">
                        {occupant.name}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 truncate leading-tight">
                        {occupant.category}
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Empty Slot */
                <button
                  type="button"
                  onClick={() => handleSlotActionInOrganize(slotIndex, undefined)}
                  aria-label={`Adicionar Web App no slot ${slotIndex}`}
                  title={`Slot #${slotIndex} livre — Clique para adicionar um Web App aqui`}
                  className={`w-full h-full min-h-0 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 ${
                    showEmptySlotGuides
                      ? 'opacity-100'
                      : 'opacity-0 group-hover/slot:opacity-100'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-slate-400 group-hover/slot:text-white group-hover/slot:border-indigo-400/40 group-hover/slot:bg-indigo-500/20 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 group-hover/slot:text-slate-200 tabular-nums">
                    #{String(slotIndex).padStart(2, '0')}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};
