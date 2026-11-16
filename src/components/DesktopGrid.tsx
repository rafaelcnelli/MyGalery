import React, { useState, useRef, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  WebAppItem,
  GridDensity,
  CATEGORY_COLORS,
} from '../types/launcher';
import {
  buildFixedSlotArray,
  formatSlotNumber,
  paginateGridSlots,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface DesktopGridProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  density: GridDensity;
  isEditMode: boolean;
  onActivateEditMode?: () => void;
  onSelectApp: (app: WebAppItem, e?: React.MouseEvent) => void;
  onDoubleClickApp?: (app: WebAppItem) => void;
  onOpenExternal?: (app: WebAppItem) => void;
  onContextMenuApp?: (app: WebAppItem, e: React.MouseEvent) => void;
  onEditApp: (app: WebAppItem) => void;
  onDeleteApp: (id: string) => void;
  onAddAtSlot: (slotIndex: number) => void;
  onSwapSlots: (sourceSlot: number, targetSlot: number) => void;
}

const MOBILE_SLOTS_PER_PAGE = 16; // 4x4 pages on mobile/tablet portrait

export const DesktopGrid: React.FC<DesktopGridProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  density,
  isEditMode,
  onActivateEditMode,
  onSelectApp,
  onDoubleClickApp,
  onOpenExternal,
  onContextMenuApp,
  onEditApp,
  onDeleteApp,
  onAddAtSlot,
  onSwapSlots,
}) => {
  const slots = useMemo(() => buildFixedSlotArray(apps), [apps]);
  const mobilePages = useMemo(
    () => paginateGridSlots(slots, MOBILE_SLOTS_PER_PAGE),
    [slots]
  );

  const [mobilePageIndex, setMobilePageIndex] = useState(0);
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const longPressTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerDownSlot = () => {
    clearLongPress();
    if (!isEditMode && onActivateEditMode) {
      longPressTimerRef.current = window.setTimeout(() => {
        onActivateEditMode();
      }, 300);
    }
  };

  const handleDragStart = (e: React.DragEvent, slotIdx: number) => {
    clearLongPress();
    setDraggedSlot(slotIdx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(slotIdx));
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== slotIdx) {
      setDragOverSlot(slotIdx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const sourceStr = e.dataTransfer.getData('text/plain');
    const sourceIdx =
      draggedSlot !== null ? draggedSlot : parseInt(sourceStr, 10);
    setDraggedSlot(null);
    setDragOverSlot(null);
    if (!Number.isNaN(sourceIdx) && sourceIdx !== targetIdx) {
      onSwapSlots(sourceIdx, targetIdx);
    }
  };

  const handleTouchStartCarousel = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEndCarousel = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0 && mobilePageIndex < mobilePages.length - 1) {
        setMobilePageIndex((p) => p + 1);
      } else if (deltaX > 0 && mobilePageIndex > 0) {
        setMobilePageIndex((p) => p - 1);
      }
    }
  };

  const densityGapClass =
    density === 'compact'
      ? 'gap-1.5 sm:gap-2 p-2 sm:p-3'
      : density === 'expanded'
        ? 'gap-2.5 sm:gap-3.5 p-3 sm:p-5'
        : 'gap-2 sm:gap-2.5 p-2.5 sm:p-4';

  const logoSize =
    density === 'compact' ? 'xs' : density === 'expanded' ? 'md' : 'sm';

  const renderSlotCell = (app: WebAppItem | null, slotIndex: number) => {
    const slotNum = formatSlotNumber(slotIndex);
    const isMatched = app ? matchingAppIds.has(app.id) : false;
    const isDimmed = hasActiveFilter && (!app || !isMatched);
    const isBeingDragged = draggedSlot === slotIndex;
    const isDragTarget = dragOverSlot === slotIndex && draggedSlot !== slotIndex;

    if (!app) {
      return (
        <button
          key={`empty-${slotIndex}`}
          type="button"
          draggable={isEditMode}
          onDragOver={(e) => handleDragOver(e, slotIndex)}
          onDragLeave={() => setDragOverSlot(null)}
          onDrop={(e) => handleDrop(e, slotIndex)}
          onPointerDown={handlePointerDownSlot}
          onPointerUp={clearLongPress}
          onPointerCancel={clearLongPress}
          onClick={() => onAddAtSlot(slotIndex)}
          className={`group relative w-full h-full min-h-[56px] rounded-xl border transition-all duration-150 flex flex-col items-center justify-center select-none ${
            isDragTarget
              ? 'border-indigo-400 bg-indigo-500/20 scale-[1.02]'
              : isEditMode
                ? 'border-dashed border-white/20 bg-zinc-900/40 hover:border-indigo-400/60 hover:bg-indigo-500/10'
                : 'border-white/[0.06] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.05]'
          } ${isDimmed ? 'opacity-20' : ''}`}
          title={`Slot #${slotNum} vazio — Clique para adicionar Web App`}
        >
          <span className="absolute top-1.5 left-2 text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
            #{slotNum}
          </span>
          <div className="w-7 h-7 rounded-lg border border-dashed border-white/10 group-hover:border-indigo-400/50 flex items-center justify-center text-zinc-600 group-hover:text-indigo-300 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </button>
      );
    }

    const catColor = CATEGORY_COLORS[app.category] || '#6366f1';

    return (
      <div
        key={app.id}
        draggable
        onDragStart={(e) => handleDragStart(e, slotIndex)}
        onDragOver={(e) => handleDragOver(e, slotIndex)}
        onDragLeave={() => setDragOverSlot(null)}
        onDrop={(e) => handleDrop(e, slotIndex)}
        onDragEnd={() => {
          setDraggedSlot(null);
          setDragOverSlot(null);
        }}
        onPointerDown={handlePointerDownSlot}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
        onPointerCancel={clearLongPress}
        onClick={(e) => {
          clearLongPress();
          if (isEditMode) {
            onEditApp(app);
            return;
          }
          onSelectApp(app, e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          clearLongPress();
          if (!isEditMode && onDoubleClickApp) {
            onDoubleClickApp(app);
          }
        }}
        onAuxClick={(e) => {
          if (e.button === 1 && onOpenExternal) {
            e.preventDefault();
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
        className={`group relative w-full h-full min-h-[56px] rounded-xl border transition-all duration-150 flex flex-col items-center justify-center p-1.5 select-none cursor-pointer ${
          isDragTarget
            ? 'border-indigo-400 bg-indigo-500/25 scale-[1.03] shadow-lg'
            : isBeingDragged
              ? 'opacity-40 scale-95 border-indigo-500/40'
              : hasActiveFilter && isMatched
                ? 'border-indigo-400/80 bg-zinc-900/90 ring-2 ring-indigo-500/30 shadow-xl'
                : 'border-white/10 bg-zinc-900/55 hover:bg-zinc-900/85 hover:border-white/25 shadow-md'
        } ${isDimmed ? 'opacity-20 grayscale' : ''} ${
          isEditMode ? 'ring-1 ring-amber-400/40 animate-pulse' : ''
        }`}
        title={`${app.name} (#${slotNum}) — Clique: Detalhes | Duplo Clique: Abrir | Botão Direito: Menu`}
      >
        {/* Top Row: #Slot Badge + Category Dot / External Indicator */}
        <div className="absolute top-1.5 inset-x-2 flex items-center justify-between pointer-events-none">
          <span className="text-[9px] font-mono font-medium text-zinc-500 group-hover:text-zinc-300">
            #{slotNum}
          </span>
          <div className="flex items-center gap-1">
            {app.openExternalOnly && (
              <span
                className="px-1 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[8px] font-mono font-bold text-amber-300"
                title="Sempre abre em Nova Aba"
              >
                ↗
              </span>
            )}
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: catColor }}
            />
          </div>
        </div>

        {/* Edit Mode Overlay Controls */}
        {isEditMode && (
          <div className="absolute -top-1.5 -right-1.5 z-20 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditApp(app);
              }}
              className="w-5 h-5 rounded-md bg-zinc-900 border border-white/20 text-zinc-200 hover:bg-indigo-600 hover:text-white flex items-center justify-center shadow"
              title="Editar App"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteApp(app.id);
              }}
              className="w-5 h-5 rounded-md bg-zinc-900 border border-white/20 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow"
              title="Remover App"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        {isEditMode && (
          <div className="absolute bottom-1 right-1 text-zinc-500 pointer-events-none">
            <GripVertical className="w-3 h-3" />
          </div>
        )}

        {/* App Icon */}
        <div className="mt-2 mb-1 transition-transform duration-150 group-hover:scale-105">
          <AppLogo
            name={app.name}
            url={app.url}
            accentColor={app.accentColor}
            customLogoUrl={app.customLogoUrl}
            size={logoSize}
          />
        </div>

        {/* App Name */}
        <span className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate max-w-[92%] text-center leading-tight">
          {app.name}
        </span>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col select-none">
      {/* DESKTOP & LANDSCAPE TABLET: Fixed 8x5 Matrix (40 slots, zero vertical scroll) */}
      <div
        className={`hidden md:grid md:grid-cols-8 md:grid-rows-5 w-full h-full max-w-[1640px] mx-auto ${densityGapClass}`}
      >
        {slots.map((app, idx) => renderSlotCell(app, idx))}
      </div>

      {/* MOBILE / PORTRAIT (< 768px): Horizontal Paginated Swipe Carousel (4x4 = 16 slots per page) */}
      <div
        className="flex md:hidden flex-col w-full h-full overflow-hidden p-2.5"
        onTouchStart={handleTouchStartCarousel}
        onTouchEnd={handleTouchEndCarousel}
      >
        <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {(mobilePages[mobilePageIndex] || []).map((app, localIdx) => {
            const globalSlotIdx =
              mobilePageIndex * MOBILE_SLOTS_PER_PAGE + localIdx;
            return renderSlotCell(app, globalSlotIdx);
          })}
        </div>

        {/* Mobile Carousel Pagination Controls */}
        <div className="h-10 shrink-0 flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            disabled={mobilePageIndex === 0}
            onClick={() => setMobilePageIndex((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-300 disabled:opacity-30"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {mobilePages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMobilePageIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  mobilePageIndex === idx
                    ? 'w-6 bg-indigo-500'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Ir para página ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={mobilePageIndex >= mobilePages.length - 1}
            onClick={() =>
              setMobilePageIndex((p) => Math.min(mobilePages.length - 1, p + 1))
            }
            className="p-1.5 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-300 disabled:opacity-30"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
