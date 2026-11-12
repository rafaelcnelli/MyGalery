import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Edit2,
  ExternalLink,
  Plus,
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  Cloud,
  HardDrive,
  FolderOpen,
  ArrowLeft,
  SlidersHorizontal,
  Move,
  X,
} from 'lucide-react';
import {
  APP_CATEGORIES,
  GridColumnsPerRow,
  GridScale,
  SyncStatus,
  WebAppItem,
} from '../types/launcher';
import {
  computeSinglePageGridMetrics,
  extractHostname,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface RetroOSViewProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  isOrganizeMode: boolean;
  onToggleOrganizeMode: () => void;
  gridColumns: GridColumnsPerRow;
  onChangeGridColumns: (cols: GridColumnsPerRow) => void;
  gridScale: GridScale;
  syncStatus: SyncStatus;
  onOpenEditModal: (app: WebAppItem) => void;
  onOpenNewAppAtSlot: (slotIndex: number) => void;
  onOpenNewAppModal: () => void;
  onOpenCloudModal: () => void;
  onMoveOrSwapSlot: (appId: string, targetSlotIndex: number) => void;
  onBackToPixelStudio: () => void;
}

type RetroViewportPreset = 'desktop' | 'tablet' | 'mobile';

/**
 * Pixelated Windows 95 Shortcut Overlay Badge (Bottom-Left White Square with Curved Pixel Arrow)
 */
const Win95ShortcutBadge: React.FC = () => (
  <span
    aria-hidden="true"
    className="absolute -bottom-0.5 -left-0.5 z-20 w-3.5 h-3.5 bg-white border border-black flex items-center justify-center shadow-none pointer-events-none"
  >
    <svg
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      className="w-2.5 h-2.5 pixelated"
    >
      <rect x="1" y="5" width="2" height="2" fill="#000000" />
      <rect x="2" y="4" width="2" height="1" fill="#000000" />
      <rect x="3" y="3" width="3" height="1" fill="#000000" />
      <rect x="5" y="1" width="2" height="4" fill="#000000" />
      <rect x="4" y="2" width="3" height="1" fill="#000000" />
    </svg>
  </span>
);

/**
 * Pixelated Windows 95 4-Color Flag Logo for [Iniciar] Button
 */
const Win95FlagSVG: React.FC = () => (
  <svg
    viewBox="0 0 12 12"
    shapeRendering="crispEdges"
    className="w-3.5 h-3.5 pixelated shrink-0"
    aria-hidden="true"
  >
    <rect x="1" y="1" width="4" height="4" fill="#ef4444" />
    <rect x="6" y="1" width="5" height="4" fill="#22c55e" />
    <rect x="1" y="6" width="4" height="5" fill="#3b82f6" />
    <rect x="6" y="6" width="5" height="5" fill="#eab308" />
  </svg>
);

export const RetroOSView: React.FC<RetroOSViewProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  isOrganizeMode,
  onToggleOrganizeMode,
  gridColumns,
  onChangeGridColumns,
  gridScale,
  syncStatus,
  onOpenEditModal,
  onOpenNewAppAtSlot,
  onOpenNewAppModal,
  onOpenCloudModal,
  onMoveOrSwapSlot,
  onBackToPixelStudio,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [propertiesApp, setPropertiesApp] = useState<WebAppItem | null>(null);
  const [retroBrowserApp, setRetroBrowserApp] = useState<WebAppItem | null>(
    null
  );
  const [browserViewport, setBrowserViewport] =
    useState<RetroViewportPreset>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [showCrtBezel, setShowCrtBezel] = useState(true);
  const [retroDarkBg, setRetroDarkBg] = useState(false);

  // Drag & Drop / Touch Move state for the 40 Slots
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [selectedForMoveAppId, setSelectedForMoveAppId] = useState<
    string | null
  >(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [now, setNow] = useState(() => new Date());

  const startMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsNarrowScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close Start Menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(e.target as Node)
      ) {
        setIsStartMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep propertiesApp synced if edited or deleted
  const activePropertiesApp = propertiesApp
    ? apps.find((a) => a.id === propertiesApp.id) || null
    : null;

  const activeBrowserApp = retroBrowserApp
    ? apps.find((a) => a.id === retroBrowserApp.id) || null
    : null;

  // Build O(1) slot lookup map for the 40 slots
  const slotMap = new Map<number, WebAppItem>();
  for (const app of apps) {
    slotMap.set(app.slotIndex, app);
  }

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

  const timeString = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main
      data-testid="retro-os-view"
      aria-label="Tela de Computador Antigo Retro OS Windows 95"
      className="relative z-10 flex-1 w-full h-full min-h-0 overflow-hidden p-0 sm:px-4 sm:pb-2.5 sm:pt-1 flex flex-col items-center justify-center select-none"
    >
      {/* Outer Beige CRT Monitor Frame on Desktop (100% Full Screen on Mobile) */}
      <div
        className={`relative w-full h-full max-w-[1600px] flex flex-col overflow-hidden transition-all ${
          showCrtBezel && !isNarrowScreen
            ? 'sm:p-3.5 sm:rounded-[28px] sm:bg-[#d8d2c5] sm:border-4 sm:border-[#b5ae9e] sm:shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_2px_2px_0px_#ffffff,inset_-3px_-3px_0px_#8c8577]'
            : ''
        }`}
      >
        {/* Inner CRT Screen Glass with Scanlines */}
        <div
          onClick={() => setSelectedAppId(null)}
          className={`relative flex-1 w-full min-h-0 flex flex-col overflow-hidden ${
            showCrtBezel && !isNarrowScreen
              ? 'sm:rounded-2xl sm:border-4 sm:border-[#524e46] shadow-inner'
              : ''
          } ${retroDarkBg ? 'bg-[#0b2b2e]' : 'bg-[#008080]'}`}
        >
          {/* Subtle CRT Scanlines Overlay (pointer-events-none so clicks never block) */}
          <div className="crt-scanlines absolute inset-0 z-30" />

          {/* Top Active Category / Organize Banner inside Win95 Desktop */}
          {(selectedCategory !== 'ALL' ||
            isOrganizeMode ||
            selectedForMoveAppId) && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 m-1.5 px-2.5 py-1 win95-outset flex flex-wrap items-center justify-between gap-2 text-xs font-pixel shrink-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="w-3.5 h-3.5 text-[#000080] shrink-0" />
                <span className="truncate font-bold text-black">
                  {selectedForMoveAppId
                    ? 'MODO MOVER: Clique em outro slot para trocar de posição (Auto-Swap).'
                    : isOrganizeMode
                      ? 'MODO ORGANIZAR WIN95: Arraste atalhos ou clique em um slot vazio (+) para criar.'
                      : `FILTRO DE ESTAÇÃO ATIVO: [${selectedCategory}]`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedCategory !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => onCategoryChange('ALL')}
                    className="win95-btn px-2 py-0.5 font-pixel text-xs font-bold cursor-pointer"
                  >
                    [Mostrar Todos os 40 Slots]
                  </button>
                )}
                {selectedForMoveAppId && (
                  <button
                    type="button"
                    onClick={() => setSelectedForMoveAppId(null)}
                    className="win95-btn px-2 py-0.5 font-pixel text-xs font-bold cursor-pointer"
                  >
                    [Cancelar]
                  </button>
                )}
              </div>
            </div>
          )}

          {/* WIN95 DESKTOP WORKSPACE: THE 40 SLOTS MATRIX */}
          <div
            data-testid="retro-desktop-grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
            className="relative z-10 flex-1 w-full min-h-0 overflow-hidden grid gap-1 sm:gap-2 p-2 sm:p-3"
          >
            {Array.from({ length: visibleSlotCount }, (_, slotIndex) => {
              const occupant = slotMap.get(slotIndex);
              const isDropTarget = dragOverSlot === slotIndex;
              const isBeingDragged = occupant && draggedAppId === occupant.id;
              const isSelectedForMove =
                occupant && selectedForMoveAppId === occupant.id;
              const isSelected =
                occupant &&
                (selectedAppId === occupant.id ||
                  activePropertiesApp?.id === occupant.id);
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
                  className={`relative group/slot min-h-0 min-w-0 flex items-center justify-center p-0.5 transition-none ${
                    isDropTarget
                      ? 'border-2 border-dashed border-yellow-300 bg-[#000080]/40'
                      : isSelectedForMove
                        ? 'border-2 border-dotted border-yellow-300 bg-yellow-400/20'
                        : showEmptySlotGuides && !occupant
                          ? 'border border-dotted border-white/40 bg-black/15 hover:bg-white/10'
                          : 'border border-transparent hover:border-dotted hover:border-white/30'
                  }`}
                >
                  {occupant ? (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, occupant)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOrganizeMode || selectedForMoveAppId) {
                          handleSlotActionInOrganize(slotIndex, occupant);
                        } else {
                          setSelectedAppId(occupant.id);
                          setPropertiesApp(occupant);
                        }
                      }}
                      data-testid={`retro-app-card-${occupant.id}`}
                      className={`group relative w-full h-full min-h-0 flex flex-col items-center justify-center gap-1 p-1 cursor-pointer ${
                        isBeingDragged ? 'opacity-40' : 'opacity-100'
                      } ${
                        isDimmed
                          ? 'opacity-25 grayscale pointer-events-none'
                          : ''
                      }`}
                    >
                      {/* Slot Index Coordinate in Organize Mode */}
                      {showEmptySlotGuides && (
                        <span className="absolute top-0.5 left-1 font-pixel text-[10px] text-yellow-200 bg-black/60 px-1">
                          #{String(slotIndex).padStart(2, '0')}
                        </span>
                      )}

                      {/* Retro Icon Container with Classic Win95 Shortcut Arrow */}
                      <div
                        className={`relative pixelated ${
                          isSelected
                            ? 'ring-1 ring-dotted ring-yellow-200 brightness-95'
                            : ''
                        }`}
                      >
                        <AppLogo
                          name={occupant.name}
                          url={occupant.url}
                          accentColor={occupant.accentColor}
                          customLogoUrl={occupant.customLogoUrl}
                          size={logoSize}
                        />
                        <Win95ShortcutBadge />
                      </div>

                      {/* Classic Windows 95 Icon Label (Navy #000080 highlight when selected) */}
                      <div className="w-full text-center px-0.5 min-w-0">
                        <span
                          className={`inline-block max-w-full truncate px-1 py-0.5 font-pixel text-xs sm:text-sm leading-none ${
                            isSelected
                              ? 'bg-[#000080] text-white border border-dotted border-yellow-200'
                              : 'text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.95)] group-hover:bg-[#000080]/80'
                          }`}
                        >
                          {occupant.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Empty Win95 Desktop Slot */
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotActionInOrganize(slotIndex, undefined);
                      }}
                      aria-label={`Adicionar atalho no slot ${slotIndex}`}
                      title={`Slot #${String(slotIndex).padStart(
                        2,
                        '0'
                      )} livre — Clique para criar atalho`}
                      className={`w-full h-full min-h-0 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        showEmptySlotGuides
                          ? 'opacity-100'
                          : 'opacity-0 group-hover/slot:opacity-100'
                      }`}
                    >
                      <div className="w-6 h-6 win95-outset flex items-center justify-center text-black">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-pixel text-[11px] text-white bg-black/60 px-1">
                        #{String(slotIndex).padStart(2, '0')}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ===================================================================== */}
          {/* 2. SPOTLIGHT RETRÔ: JANELA DE PROPRIEDADES DO WINDOWS 95              */}
          {/* ===================================================================== */}
          {activePropertiesApp && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="win95-props-title"
              onClick={() => setPropertiesApp(null)}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-3"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                data-testid="win95-properties-modal"
                className="w-full max-w-md win95-window p-1.5 flex flex-col gap-2"
              >
                {/* Classic Navy Blue Title Bar */}
                <div className="win95-titlebar px-2 py-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Win95FlagSVG />
                    <span
                      id="win95-props-title"
                      className="font-pixel-title text-[9px] sm:text-[10px] text-white truncate"
                    >
                      Propriedades de {activePropertiesApp.name}.lnk
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPropertiesApp(null)}
                    aria-label="Fechar janela de propriedades"
                    className="win95-btn w-5 h-5 flex items-center justify-center font-mono text-xs font-bold text-black cursor-pointer shrink-0"
                  >
                    X
                  </button>
                </div>

                {/* Inner Tabbed-Style Properties Sheet */}
                <div className="win95-outset p-3 space-y-3">
                  {/* Top Row: App Icon + Metadata + Quick Edit Button */}
                  <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#808080]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative p-1 win95-inset bg-white shrink-0">
                        <AppLogo
                          name={activePropertiesApp.name}
                          url={activePropertiesApp.url}
                          accentColor={activePropertiesApp.accentColor}
                          customLogoUrl={activePropertiesApp.customLogoUrl}
                          size="md"
                        />
                        <Win95ShortcutBadge />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-pixel-title text-xs text-black truncate">
                          {activePropertiesApp.name}
                        </h3>
                        <p className="font-pixel text-sm text-[#000080] font-bold">
                          Categoria: {activePropertiesApp.category} · Slot #
                          {String(activePropertiesApp.slotIndex).padStart(
                            2,
                            '0'
                          )}
                        </p>
                        <p className="font-mono text-[11px] text-neutral-700 truncate">
                          {extractHostname(activePropertiesApp.url)}
                        </p>
                      </div>
                    </div>

                    {/* Beveled Edit Button with Pencil Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        const target = activePropertiesApp;
                        setPropertiesApp(null);
                        onOpenEditModal(target);
                      }}
                      data-testid="win95-edit-button"
                      aria-label={`Editar ${activePropertiesApp.name}`}
                      title="Editar nome, URL, ícone, cor, slot ou excluir"
                      className="win95-btn px-2.5 py-1.5 flex items-center gap-1 font-pixel text-sm font-bold text-black cursor-pointer shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#000080]" />
                      <span>Editar</span>
                    </button>
                  </div>

                  {/* Target URL Field in Recessed Inset Box */}
                  <div className="space-y-1">
                    <label className="block font-pixel text-xs font-bold text-black">
                      Destino (URL do Atalho):
                    </label>
                    <div className="win95-inset px-2 py-1 font-mono text-xs text-black truncate select-all">
                      {activePropertiesApp.url}
                    </div>
                  </div>

                  {/* Bottom 3D Beveled Launch Action Buttons */}
                  <div className="pt-2 border-t border-[#808080] flex flex-col sm:flex-row items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = activePropertiesApp;
                        setPropertiesApp(null);
                        setRetroBrowserApp(target);
                      }}
                      data-testid="win95-open-in-hub"
                      className="flex-1 min-h-[38px] win95-btn px-3 py-1.5 font-pixel text-sm sm:text-base font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer border border-black"
                    >
                      <Monitor className="w-4 h-4 text-[#000080] shrink-0" />
                      <span>[ Executar no Hub (Interno) ]</span>
                    </button>

                    <a
                      href={activePropertiesApp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setPropertiesApp(null)}
                      data-testid="win95-open-external"
                      className="flex-1 min-h-[38px] win95-btn px-3 py-1.5 font-pixel text-sm sm:text-base font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>[ Abrir no Navegador ↗ ]</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#000080] shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. VISUALIZADOR INTERNO ESTILO "NAVEGADOR ANTIGO (IE4 / NETSCAPE)"    */}
          {/* ===================================================================== */}
          {activeBrowserApp && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Navegador Retrô - ${activeBrowserApp.name}`}
              data-testid="retro-browser-window"
              className="absolute inset-0 z-40 win95-window p-1 flex flex-col overflow-hidden"
            >
              {/* Classic Win95 Title Bar */}
              <div className="win95-titlebar px-2 py-1 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Win95FlagSVG />
                  <span className="font-pixel-title text-[9px] sm:text-[10px] text-white truncate">
                    {activeBrowserApp.name} - Netscape / Internet Explorer 4.0
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRetroBrowserApp(null)}
                    aria-label="Fechar navegador retrô"
                    className="win95-btn px-2 h-5 flex items-center justify-center font-mono text-xs font-bold text-black cursor-pointer"
                  >
                    [X] Fechar
                  </button>
                </div>
              </div>

              {/* Classic Beveled Browser Toolbar + Address Bar + Viewport Switcher */}
              <div className="win95-outset px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-[#808080]">
                {/* Left Navigation Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRetroBrowserApp(null)}
                    className="win95-btn px-2 py-1 font-pixel text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Área de Trabalho</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIframeKey((k) => k + 1)}
                    title="Recarregar página"
                    className="win95-btn px-2 py-1 font-pixel text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>
                </div>

                {/* Recessed Address Bar */}
                <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
                  <span className="font-pixel text-xs sm:text-sm font-bold text-black hidden md:inline">
                    Endereço:
                  </span>
                  <div className="flex-1 win95-inset px-2 py-0.5 font-mono text-xs text-black truncate">
                    {activeBrowserApp.url}
                  </div>
                </div>

                {/* Viewport Simulation Buttons (Desktop Only — Mobile is always 100% full screen) */}
                <div className="hidden md:flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setBrowserViewport('desktop')}
                    className={`win95-btn px-2 py-1 font-pixel text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      browserViewport === 'desktop' ? 'win95-btn-active' : ''
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrowserViewport('tablet')}
                    className={`win95-btn px-2 py-1 font-pixel text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      browserViewport === 'tablet' ? 'win95-btn-active' : ''
                    }`}
                  >
                    <Tablet className="w-3 h-3" />
                    <span>Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrowserViewport('mobile')}
                    className={`win95-btn px-2 py-1 font-pixel text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      browserViewport === 'mobile' ? 'win95-btn-active' : ''
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>

                {/* Open Externally */}
                <a
                  href={activeBrowserApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win95-btn px-2.5 py-1 font-pixel text-xs sm:text-sm font-bold flex items-center gap-1 text-black shrink-0"
                >
                  <span>Abrir Fora ↗</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Browser Content Stage */}
              <div className="flex-1 w-full min-h-0 win95-inset bg-[#808080] flex items-center justify-center overflow-hidden">
                {/* Mobile always renders 100% full bleed */}
                <div className="w-full h-full sm:hidden bg-white">
                  <iframe
                    key={`retro-mob-${iframeKey}`}
                    src={activeBrowserApp.url}
                    title={activeBrowserApp.name}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>

                {/* Desktop Viewports */}
                <div className="hidden sm:flex w-full h-full items-center justify-center">
                  {browserViewport === 'desktop' && (
                    <iframe
                      key={`retro-desk-${iframeKey}`}
                      src={activeBrowserApp.url}
                      title={activeBrowserApp.name}
                      className="w-full h-full border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  )}
                  {browserViewport === 'tablet' && (
                    <div className="w-[768px] max-w-full h-full win95-window p-2 flex flex-col">
                      <iframe
                        key={`retro-tab-${iframeKey}`}
                        src={activeBrowserApp.url}
                        title={activeBrowserApp.name}
                        className="flex-1 w-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  )}
                  {browserViewport === 'mobile' && (
                    <div className="w-[390px] max-w-full h-full win95-window p-2 flex flex-col">
                      <iframe
                        key={`retro-phone-${iframeKey}`}
                        src={activeBrowserApp.url}
                        title={activeBrowserApp.name}
                        className="flex-1 w-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. BARRA DE TAREFAS INFERIOR DO WINDOWS 95 + MENU [INICIAR]           */}
          {/* ===================================================================== */}
          <div
            ref={startMenuRef}
            onClick={(e) => e.stopPropagation()}
            className="relative z-30 w-full win95-outset px-1.5 py-1 flex items-center justify-between gap-1.5 shrink-0"
          >
            {/* Cascading Windows 95 Start Menu Popup */}
            {isStartMenuOpen && (
              <div
                data-testid="win95-start-menu"
                className="absolute bottom-full left-1 mb-1 w-72 sm:w-80 win95-window p-1 flex z-50"
              >
                {/* Classic Vertical Navy Blue Side Banner */}
                <div className="w-7 bg-gradient-to-t from-[#000080] via-[#000080] to-[#1084d0] flex items-end justify-center pb-3 select-none shrink-0">
                  <span className="-rotate-90 whitespace-nowrap font-pixel-title text-[10px] text-white tracking-widest">
                    APPS HUB 95
                  </span>
                </div>

                {/* Menu Items List */}
                <div className="flex-1 p-1 space-y-1 text-black font-pixel text-sm">
                  {/* Back to Indie Pixel Studio (Zoom Out) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsStartMenuOpen(false);
                      onBackToPixelStudio();
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span>Voltar ao Estúdio Indie (Zoom Out)</span>
                  </button>

                  <div className="border-t border-[#808080] border-b border-white my-1" />

                  {/* Category Filter Section */}
                  <div className="px-2 py-0.5 text-xs font-bold text-[#000080]">
                    FILTRAR POR ESTAÇÃO / CATEGORIA:
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange('ALL');
                        setIsStartMenuOpen(false);
                      }}
                      className={`text-left px-2 py-1 text-xs font-bold cursor-pointer ${
                        selectedCategory === 'ALL'
                          ? 'bg-[#000080] text-white'
                          : 'hover:bg-[#000080] hover:text-white'
                      }`}
                    >
                      • Todos (40 Slots)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange('DevTools,IA');
                        setIsStartMenuOpen(false);
                      }}
                      className={`text-left px-2 py-1 text-xs font-bold cursor-pointer ${
                        selectedCategory === 'DevTools,IA'
                          ? 'bg-[#000080] text-white'
                          : 'hover:bg-[#000080] hover:text-white'
                      }`}
                    >
                      • DevTools & IA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange('Design,Social,Cliente');
                        setIsStartMenuOpen(false);
                      }}
                      className={`text-left px-2 py-1 text-xs font-bold cursor-pointer ${
                        selectedCategory === 'Design,Social,Cliente'
                          ? 'bg-[#000080] text-white'
                          : 'hover:bg-[#000080] hover:text-white'
                      }`}
                    >
                      • Design & Social
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange('Finanças,Produtividade,Utilitário,SaaS');
                        setIsStartMenuOpen(false);
                      }}
                      className={`text-left px-2 py-1 text-xs font-bold cursor-pointer ${
                        selectedCategory ===
                        'Finanças,Produtividade,Utilitário,SaaS'
                          ? 'bg-[#000080] text-white'
                          : 'hover:bg-[#000080] hover:text-white'
                      }`}
                    >
                      • Finanças & Prod.
                    </button>
                    {APP_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          onCategoryChange(cat);
                          setIsStartMenuOpen(false);
                        }}
                        className={`text-left px-2 py-0.5 text-xs cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-[#000080] text-white font-bold'
                            : 'hover:bg-[#000080] hover:text-white'
                        }`}
                      >
                        ◦ {cat}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#808080] border-b border-white my-1" />

                  {/* Columns per Row Selector in Start Menu */}
                  <div className="px-2 py-1 flex items-center justify-between gap-1">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" /> Colunas:
                    </span>
                    <div className="flex items-center gap-1">
                      {([2, 3, 4, 6, 8] as GridColumnsPerRow[]).map((cols) => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => onChangeGridColumns(cols)}
                          className={`win95-btn px-1.5 py-0.5 text-xs font-mono font-bold cursor-pointer ${
                            gridColumns === cols ? 'win95-btn-active' : ''
                          }`}
                        >
                          {cols}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Customizations */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleOrganizeMode();
                      setIsStartMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isOrganizeMode
                        ? 'Desativar Modo Organizar'
                        : 'Organizar / Mover Slots'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRetroDarkBg((prev) => !prev)}
                    className="w-full text-left px-2.5 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Monitor className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Fundo: {retroDarkBg ? 'Teal Clássico (#008080)' : 'Teal Noturno'}
                    </span>
                  </button>

                  {!isNarrowScreen && (
                    <button
                      type="button"
                      onClick={() => setShowCrtBezel((prev) => !prev)}
                      className="w-full text-left px-2.5 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Moldura CRT Bege: {showCrtBezel ? 'Ligada' : 'Desligada'}
                      </span>
                    </button>
                  )}

                  <div className="border-t border-[#808080] border-b border-white my-1" />

                  {/* Cloud Sync & New App */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsStartMenuOpen(false);
                      onOpenCloudModal();
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <Cloud className="w-4 h-4 shrink-0" />
                    <span>Sincronização Nuvem & Backup JSON...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsStartMenuOpen(false);
                      onOpenNewAppModal();
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Novo Atalho Web App...</span>
                  </button>
                </div>
              </div>
            )}

            {/* Left: [Iniciar] Button + Quick Studio Zoom-Out Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsStartMenuOpen((prev) => !prev)}
                data-testid="win95-start-button"
                className={`win95-btn px-2.5 py-1 flex items-center gap-1.5 font-pixel-title text-[10px] sm:text-xs font-bold text-black cursor-pointer ${
                  isStartMenuOpen ? 'win95-btn-active' : ''
                }`}
              >
                <Win95FlagSVG />
                <span>Iniciar</span>
              </button>

              <button
                type="button"
                onClick={onBackToPixelStudio}
                title="Voltar ao Estúdio Indie (Zoom Out)"
                className="hidden sm:inline-flex win95-btn px-2 py-1 items-center gap-1 font-pixel text-xs sm:text-sm font-bold text-black cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Estúdio Pixel</span>
              </button>
            </div>

            {/* Center: Recessed Quick Search Input (Raycast Retrô) */}
            <div className="flex items-center gap-1 flex-1 max-w-xs min-w-[110px]">
              <div className="relative flex-1 win95-inset flex items-center px-1.5 py-0.5 bg-white">
                <Search className="w-3 h-3 text-[#808080] shrink-0 mr-1" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar app ou URL..."
                  aria-label="Buscar aplicativo no Retro OS"
                  className="w-full bg-transparent text-black placeholder-neutral-500 font-pixel text-xs sm:text-sm focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Limpar busca"
                    className="text-black hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: System Tray (Cloud Sync Indicator + Real-Time Digital Clock) */}
            <div className="win95-inset-panel px-2 py-0.5 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenCloudModal}
                title="Status da Nuvem / Backup"
                className="flex items-center gap-1 text-black cursor-pointer"
              >
                {syncStatus === 'online' ? (
                  <Cloud className="w-3.5 h-3.5 text-[#000080]" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-neutral-700" />
                )}
                <span className="hidden md:inline font-pixel text-xs font-bold">
                  {syncStatus === 'online' ? 'ONLINE' : 'LOCAL'}
                </span>
              </button>

              <span className="font-mono text-xs font-bold text-black tabular-nums">
                {timeString}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CRT Monitor Physical Chin Badge (Desktop Only) */}
        {showCrtBezel && !isNarrowScreen && (
          <div className="hidden sm:flex items-center justify-between px-4 pt-1.5 text-xs font-pixel text-neutral-700 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-pixel-title text-[9px] text-neutral-800">
                SONOMA-CRT // MULTISYNC 95
              </span>
              <span className="text-neutral-500">·</span>
              <span>40 SLOTS MATRIX</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCrtBezel(false)}
                className="text-[11px] underline hover:text-black cursor-pointer"
              >
                Ocultar Borda do Monitor
              </button>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-700 shadow-[0_0_6px_#22c55e]" />
                POWER
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
