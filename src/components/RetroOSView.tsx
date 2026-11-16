import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  Monitor,
  Gamepad2,
  Zap,
  Sparkles,
  FolderOpen,
  Info,
} from 'lucide-react';
import { WebAppItem, GridDensity } from '../types/launcher';
import {
  buildFixedSlotArray,
  extractHostname,
  formatSlotNumber,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface RetroOSViewProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  density: GridDensity;
  isEditMode: boolean;
  activeRoomCategoryFilter?: string;
  onClearRoomFilter?: () => void;
  onBackToPixelStudio: () => void;
  onSelectApp: (app: WebAppItem, e?: React.MouseEvent) => void;
  onOpenExternal: (app: WebAppItem) => void;
  onTransferToModernPreview: (app: WebAppItem) => void;
  onContextMenuApp?: (app: WebAppItem, e: React.MouseEvent) => void;
  onEditApp: (app: WebAppItem) => void;
  onDeleteApp: (id: string) => void;
  onAddAtSlot: (slotIndex: number) => void;
  onSwapSlots: (sourceSlot: number, targetSlot: number) => void;
}

interface RetroWindowInstance {
  id: string;
  app: WebAppItem;
  kind: 'browser' | 'properties';
  minimized: boolean;
  maximized: boolean;
  reloadKey: number;
}

const MAX_RETRO_WINDOWS = 3;

export const RetroOSView: React.FC<RetroOSViewProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  density,
  isEditMode,
  activeRoomCategoryFilter,
  onClearRoomFilter,
  onBackToPixelStudio,
  onOpenExternal,
  onTransferToModernPreview,
  onContextMenuApp,
  onEditApp,
  onDeleteApp,
  onAddAtSlot,
  onSwapSlots,
}) => {
  const slots = useMemo(() => buildFixedSlotArray(apps), [apps]);

  const [windows, setWindows] = useState<RetroWindowInstance[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [crtScanlines, setCrtScanlines] = useState(true);
  const [selectedDesktopSlot, setSelectedDesktopSlot] = useState<number | null>(
    null
  );
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [clockText, setClockText] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setClockText(
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const id = window.setInterval(updateClock, 10000);
    return () => window.clearInterval(id);
  }, []);

  const roomFilteredCategories = useMemo(() => {
    if (!activeRoomCategoryFilter) return null;
    return new Set(
      activeRoomCategoryFilter
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }, [activeRoomCategoryFilter]);

  const openRetroWindow = (
    app: WebAppItem,
    kind: 'browser' | 'properties'
  ) => {
    setIsStartMenuOpen(false);
    if (kind === 'browser' && app.openExternalOnly) {
      onOpenExternal(app);
      return;
    }

    setWindows((prev) => {
      const existing = prev.find((w) => w.app.id === app.id && w.kind === kind);
      if (existing) {
        setFocusedWindowId(existing.id);
        return prev.map((w) =>
          w.id === existing.id ? { ...w, minimized: false } : w
        );
      }

      const newWin: RetroWindowInstance = {
        id: `${app.id}-${kind}-${Date.now()}`,
        app,
        kind,
        minimized: false,
        maximized: kind === 'browser',
        reloadKey: 0,
      };

      const trimmed =
        prev.length >= MAX_RETRO_WINDOWS ? prev.slice(1) : prev;
      setFocusedWindowId(newWin.id);
      return [...trimmed, newWin];
    });
  };

  const closeRetroWindow = (winId: string) => {
    setWindows((prev) => {
      const next = prev.filter((w) => w.id !== winId);
      if (focusedWindowId === winId) {
        const lastVisible = [...next].reverse().find((w) => !w.minimized);
        setFocusedWindowId(lastVisible ? lastVisible.id : null);
      }
      return next;
    });
  };

  const toggleMinimizeWindow = (winId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== winId) return w;
        const nextMin = !w.minimized;
        if (!nextMin) setFocusedWindowId(winId);
        return { ...w, minimized: nextMin };
      })
    );
  };

  const toggleMaximizeWindow = (winId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, maximized: !w.maximized } : w))
    );
  };

  const reloadBrowserWindow = (winId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === winId ? { ...w, reloadKey: w.reloadKey + 1 } : w
      )
    );
  };

  const activeWindow = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized);
    if (visible.length === 0) return null;
    return (
      visible.find((w) => w.id === focusedWindowId) ||
      visible[visible.length - 1]
    );
  }, [windows, focusedWindowId]);

  const gapClass =
    density === 'compact'
      ? 'gap-1.5 p-2'
      : density === 'expanded'
        ? 'gap-3 p-4'
        : 'gap-2 p-3';

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center p-1.5 sm:p-3 select-none"
      onClick={() => {
        setIsStartMenuOpen(false);
        setSelectedDesktopSlot(null);
      }}
    >
      {/* Physical Beige 90s CRT Monitor Bezel */}
      <div className="relative w-full h-full max-w-[1600px] rounded-2xl bg-[#d6d2c4] p-2 sm:p-3.5 border-4 border-[#f2efe4] shadow-[inset_-4px_-4px_0_#8e8a7e,0_20px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Inner CRT Screen Glass */}
        <div className="relative flex-1 w-full h-full rounded-lg bg-[#008080] border-4 border-[#4a4842] overflow-hidden flex flex-col">
          {/* Optional CRT Scanlines Overlay */}
          {crtScanlines && (
            <div
              aria-hidden="true"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%)',
                backgroundSize: '100% 4px',
              }}
              className="pointer-events-none absolute inset-0 z-40"
            />
          )}

          {/* Top Retro Info Strip */}
          <div className="h-7 px-2.5 bg-[#c0c0c0] border-b-2 border-[#404040] flex items-center justify-between text-[11px] font-mono text-black shrink-0 z-20">
            <div className="flex items-center gap-2 truncate">
              <Monitor className="w-3.5 h-3.5 text-teal-800 shrink-0" />
              <span className="font-bold">RETRO_OS v4.0 // 40-SLOTS</span>
              {activeRoomCategoryFilter && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-200 border border-black text-[10px]">
                  Sala: {activeRoomCategoryFilter}
                  {onClearRoomFilter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearRoomFilter();
                      }}
                      className="ml-1 font-bold hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCrtScanlines((prev) => !prev);
                }}
                className="px-2 py-0.5 bg-[#dfdfdf] border border-black text-[10px] font-bold hover:bg-white cursor-pointer"
                title="Alternar efeito Scanlines CRT"
              >
                CRT: {crtScanlines ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBackToPixelStudio();
                }}
                className="px-2 py-0.5 bg-[#000080] text-white border border-black text-[10px] font-bold hover:bg-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Gamepad2 className="w-3 h-3" />
                <span>Estúdio Pixel</span>
              </button>
            </div>
          </div>

          {/* Desktop 8x5 Matrix of 40 Win95/98 Slots */}
          <div
            className={`relative flex-1 grid grid-cols-5 sm:grid-cols-8 sm:grid-rows-5 w-full h-full overflow-hidden ${gapClass}`}
          >
            {slots.map((app, slotIdx) => {
              const slotNum = formatSlotNumber(slotIdx);
              const isMatchedFilter = app ? matchingAppIds.has(app.id) : false;
              const isMatchedRoom =
                !roomFilteredCategories ||
                (app && roomFilteredCategories.has(app.category));
              const isDimmed =
                (hasActiveFilter && (!app || !isMatchedFilter)) ||
                (roomFilteredCategories && (!app || !isMatchedRoom));
              const isSelected = selectedDesktopSlot === slotIdx;

              if (!app) {
                return (
                  <button
                    key={`retro-empty-${slotIdx}`}
                    type="button"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedSlot !== null && draggedSlot !== slotIdx) {
                        onSwapSlots(draggedSlot, slotIdx);
                      }
                      setDraggedSlot(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddAtSlot(slotIdx);
                    }}
                    className={`group relative rounded border border-dashed border-white/25 hover:border-white/70 hover:bg-white/10 flex flex-col items-center justify-center p-1 transition-opacity ${
                      isDimmed ? 'opacity-20' : 'opacity-80'
                    }`}
                    title={`Slot #${slotNum} livre — Clique para instalar novo Web App`}
                  >
                    <span className="absolute top-0.5 left-1 text-[9px] font-mono text-white/70">
                      #{slotNum}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-white/70" />
                  </button>
                );
              }

              return (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => setDraggedSlot(slotIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedSlot !== null && draggedSlot !== slotIdx) {
                      onSwapSlots(draggedSlot, slotIdx);
                    }
                    setDraggedSlot(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDesktopSlot(slotIdx);
                    if (isEditMode) {
                      onEditApp(app);
                    } else if (e.metaKey || e.ctrlKey) {
                      onOpenExternal(app);
                    } else {
                      openRetroWindow(app, 'properties');
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    openRetroWindow(app, 'browser');
                  }}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
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
                  className={`group relative rounded flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#000080]/80 ring-1 ring-dotted ring-yellow-200'
                      : 'hover:bg-white/15'
                  } ${isDimmed ? 'opacity-20 grayscale' : ''}`}
                  title={`${app.name} (#${slotNum}) — Clique: Propriedades | Duplo Clique: Navegador Retro`}
                >
                  <span className="absolute top-0.5 left-1 text-[9px] font-mono text-white/90 drop-shadow">
                    #{slotNum}
                  </span>

                  {app.openExternalOnly && (
                    <span className="absolute top-0.5 right-1 px-1 bg-amber-300 text-black font-mono text-[8px] font-bold border border-black">
                      ↗
                    </span>
                  )}

                  <div className="scale-90">
                    <AppLogo
                      name={app.name}
                      url={app.url}
                      accentColor={app.accentColor}
                      customLogoUrl={app.customLogoUrl}
                      size="xs"
                    />
                  </div>

                  <span
                    className={`mt-1 px-1 text-[10px] font-mono leading-tight truncate max-w-[96%] ${
                      isSelected
                        ? 'bg-[#000080] text-white'
                        : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]'
                    }`}
                  >
                    {app.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Retro OS Window (Properties or Retro Browser) */}
          {activeWindow && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute z-30 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl flex flex-col text-black font-mono ${
                activeWindow.maximized
                  ? 'inset-2 bottom-10'
                  : 'w-[92%] max-w-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              }`}
            >
              {/* Win95 Title Bar */}
              <div className="h-7 px-2 bg-gradient-to-r from-[#000080] to-[#1084d0] text-white flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  {activeWindow.kind === 'browser' ? (
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="text-xs font-bold truncate">
                    [#{formatSlotNumber(activeWindow.app.slotIndex)}]{' '}
                    {activeWindow.app.name} —{' '}
                    {activeWindow.kind === 'browser'
                      ? 'Retro Navigator'
                      : 'Propriedades do Sistema'}
                  </span>
                </div>

                {/* Window Title Bar Controls + [⚡ Modo Moderno] Transfer Button */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const targetApp = activeWindow.app;
                      closeRetroWindow(activeWindow.id);
                      onTransferToModernPreview(targetApp);
                    }}
                    className="px-2 py-0.5 bg-amber-300 hover:bg-amber-200 text-black border border-black text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Transferir este App para a janela moderna Live Preview"
                  >
                    <Zap className="w-3 h-3 fill-black" />
                    <span>⚡ Modo Moderno</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleMinimizeWindow(activeWindow.id)}
                    className="w-5 h-5 bg-[#c0c0c0] text-black border border-t-white border-l-white border-r-black border-b-black text-xs font-bold flex items-center justify-center"
                    title="Minimizar para a Barra de Tarefas"
                  >
                    _
                  </button>
                  {activeWindow.kind === 'browser' && (
                    <button
                      type="button"
                      onClick={() => toggleMaximizeWindow(activeWindow.id)}
                      className="w-5 h-5 bg-[#c0c0c0] text-black border border-t-white border-l-white border-r-black border-b-black text-xs font-bold flex items-center justify-center"
                      title="Maximizar / Restaurar"
                    >
                      □
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => closeRetroWindow(activeWindow.id)}
                    className="w-5 h-5 bg-[#c0c0c0] hover:bg-red-600 hover:text-white text-black border border-t-white border-l-white border-r-black border-b-black text-xs font-bold flex items-center justify-center"
                    title="Fechar Janela"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Window Content */}
              {activeWindow.kind === 'properties' ? (
                <div className="p-4 space-y-4 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-t-black border-l-black border-r-white border-b-white">
                    <AppLogo
                      name={activeWindow.app.name}
                      url={activeWindow.app.url}
                      accentColor={activeWindow.app.accentColor}
                      customLogoUrl={activeWindow.app.customLogoUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">
                        {activeWindow.app.name}
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        Slot #{formatSlotNumber(activeWindow.app.slotIndex)} •{' '}
                        {activeWindow.app.category}
                      </p>
                      <p className="text-[11px] text-blue-800 truncate mt-0.5">
                        {activeWindow.app.url}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openRetroWindow(activeWindow.app, 'browser')
                      }
                      className="py-2 px-2 bg-[#dfdfdf] hover:bg-white border-2 border-t-white border-l-white border-r-black border-b-black font-bold flex items-center justify-center gap-1"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Executar CRT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenExternal(activeWindow.app)}
                      className="py-2 px-2 bg-[#dfdfdf] hover:bg-white border-2 border-t-white border-l-white border-r-black border-b-black font-bold flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Nova Aba ↗</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = activeWindow.app;
                        closeRetroWindow(activeWindow.id);
                        onEditApp(target);
                      }}
                      className="py-2 px-2 bg-[#dfdfdf] hover:bg-white border-2 border-t-white border-l-white border-r-black border-b-black font-bold flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = activeWindow.app.id;
                        closeRetroWindow(activeWindow.id);
                        onDeleteApp(targetId);
                      }}
                      className="py-2 px-2 bg-[#dfdfdf] hover:bg-red-100 text-red-800 border-2 border-t-white border-l-white border-r-black border-b-black font-bold flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-[260px]">
                  {/* Retro Address Bar */}
                  <div className="p-1.5 bg-[#c0c0c0] border-b border-neutral-500 flex items-center gap-1.5 text-xs">
                    <span className="font-bold">URL:</span>
                    <div className="flex-1 px-2 py-0.5 bg-white border border-black truncate">
                      {activeWindow.app.url} (
                      {extractHostname(activeWindow.app.url)})
                    </div>
                    <button
                      type="button"
                      onClick={() => reloadBrowserWindow(activeWindow.id)}
                      className="px-2 py-0.5 bg-[#dfdfdf] border border-black font-bold flex items-center gap-1"
                      title="Recarregar"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenExternal(activeWindow.app)}
                      className="px-2 py-0.5 bg-[#dfdfdf] border border-black font-bold flex items-center gap-1"
                      title="Abrir em Nova Aba"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>↗</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-white">
                    <iframe
                      key={`${activeWindow.id}-${activeWindow.reloadKey}`}
                      src={activeWindow.app.url}
                      title={activeWindow.app.name}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Classic Win95 Start Menu */}
          {isStartMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-9 left-1 z-40 w-64 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl flex text-black font-mono text-xs"
            >
              <div className="w-7 bg-[#000080] text-white flex items-end justify-center pb-2 font-bold">
                <span className="-rotate-90 whitespace-nowrap tracking-widest text-[11px]">
                  RETRO OS 98
                </span>
              </div>
              <div className="flex-1 p-1.5 divide-y divide-neutral-400">
                <div className="pb-1.5 max-h-48 overflow-y-auto space-y-0.5">
                  {apps.slice(0, 12).map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => openRetroWindow(app, 'browser')}
                      className="w-full px-2 py-1 hover:bg-[#000080] hover:text-white flex items-center justify-between text-left"
                    >
                      <span className="truncate">{app.name}</span>
                      <span className="text-[10px] opacity-75">
                        #{formatSlotNumber(app.slotIndex)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStartMenuOpen(false);
                      onAddAtSlot(0);
                    }}
                    className="w-full px-2 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2 text-left font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Web App...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStartMenuOpen(false);
                      onBackToPixelStudio();
                    }}
                    className="w-full px-2 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2 text-left font-bold"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Voltar ao Estúdio Pixel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Multi-Window Taskbar (Up to 3 Simultaneous Windows) */}
          <div className="h-8 px-1.5 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between gap-2 shrink-0 z-30 font-mono text-xs text-black">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStartMenuOpen((prev) => !prev);
                }}
                className={`px-2.5 py-0.5 border-2 font-bold flex items-center gap-1 shrink-0 cursor-pointer ${
                  isStartMenuOpen
                    ? 'border-t-black border-l-black border-r-white border-b-white bg-[#dfdfdf]'
                    : 'border-t-white border-l-white border-r-black border-b-black bg-[#c0c0c0]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-800" />
                <span>Iniciar</span>
              </button>

              {/* Multi-Window Taskbar Tabs (Max 3) */}
              <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1">
                {windows.map((win) => {
                  const isFocused =
                    !win.minimized && activeWindow?.id === win.id;
                  return (
                    <button
                      key={win.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFocused) {
                          toggleMinimizeWindow(win.id);
                        } else {
                          setWindows((prev) =>
                            prev.map((w) =>
                              w.id === win.id ? { ...w, minimized: false } : w
                            )
                          );
                          setFocusedWindowId(win.id);
                        }
                      }}
                      className={`px-2 py-0.5 border-2 text-[11px] truncate max-w-[160px] flex items-center gap-1 cursor-pointer ${
                        isFocused
                          ? 'bg-[#e6e6e6] border-t-black border-l-black border-r-white border-b-white font-bold'
                          : 'bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-black'
                      }`}
                    >
                      <span className="truncate">
                        #{formatSlotNumber(win.app.slotIndex)} {win.app.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Tray Clock */}
            <div className="px-2 py-0.5 bg-[#bdbdbd] border border-t-neutral-600 border-l-neutral-600 border-r-white border-b-white text-[11px] font-bold shrink-0">
              {clockText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
