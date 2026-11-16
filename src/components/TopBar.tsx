import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Globe,
  Gamepad2,
  Monitor,
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  X,
  Cloud,
  Check,
  Sparkles,
  Zap,
  Maximize2,
} from 'lucide-react';
import {
  ViewMode,
  WallpaperTheme,
  GridDensity,
  AppCategory,
} from '../types/launcher';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  hubTitle: string;
  onUpdateHubTitle: (title: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  wallpaperTheme: WallpaperTheme;
  onWallpaperChange: (theme: WallpaperTheme) => void;
  gridDensity: GridDensity;
  onGridDensityChange: (density: GridDensity) => void;
  searchQuery: string;
  selectedCategory: AppCategory | 'Todas';
  onClearFilter: () => void;
  onOpenCommandPalette: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddClick: () => void;
  onOpenCloudSync: () => void;
  cloudConnected: boolean;
  firebaseLoggedIn?: boolean;
  firebaseSyncing?: boolean;
  isMinimized: boolean;
  onToggleMinimized: () => void;
  directLaunchMode?: boolean;
  onToggleDirectLaunchMode?: () => void;
  totalAppsCount: number;
}

const MODE_OPTIONS: {
  id: ViewMode;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  shortcut: string;
}[] = [
  { id: 'grid', label: 'Grid', shortLabel: 'Grid', icon: LayoutGrid, shortcut: '1' },
  { id: 'sphere', label: 'Esfera', shortLabel: 'Esfera', icon: Globe, shortcut: '2' },
  {
    id: 'pixel-studio',
    label: 'Estúdio Pixel',
    shortLabel: 'Pixel',
    icon: Gamepad2,
    shortcut: '3',
  },
  { id: 'retro-os', label: 'Retro OS', shortLabel: 'Retro', icon: Monitor, shortcut: '4' },
];

const THEME_OPTIONS: { id: WallpaperTheme; label: string; preview: string }[] = [
  { id: 'aurora', label: 'Aurora', preview: 'from-indigo-600 to-purple-600' },
  { id: 'midnight', label: 'Midnight', preview: 'from-zinc-800 to-slate-950' },
  { id: 'cyber', label: 'Cyber', preview: 'from-fuchsia-600 to-cyan-500' },
  { id: 'ocean', label: 'Ocean', preview: 'from-cyan-600 to-blue-800' },
];

const DENSITY_OPTIONS: { id: GridDensity; label: string }[] = [
  { id: 'compact', label: 'Compacto' },
  { id: 'normal', label: 'Padrão' },
  { id: 'expanded', label: 'Expandido' },
];

export const TopBar: React.FC<TopBarProps> = ({
  hubTitle,
  onUpdateHubTitle,
  viewMode,
  onViewModeChange,
  wallpaperTheme,
  onWallpaperChange,
  gridDensity,
  onGridDensityChange,
  searchQuery,
  selectedCategory,
  onClearFilter,
  onOpenCommandPalette,
  isEditMode,
  onToggleEditMode,
  onAddClick,
  onOpenCloudSync,
  cloudConnected,
  firebaseLoggedIn = false,
  firebaseSyncing = false,
  isMinimized,
  onToggleMinimized,
  directLaunchMode = false,
  onToggleDirectLaunchMode,
  totalAppsCount,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(hubTitle);
  const [isSystemPopoverOpen, setIsSystemPopoverOpen] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftTitle(hubTitle);
  }, [hubTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isSystemPopoverOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsSystemPopoverOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isSystemPopoverOpen]);

  const commitTitle = () => {
    const trimmed = draftTitle.trim() || 'My Web Creations Hub';
    onUpdateHubTitle(trimmed);
    setDraftTitle(trimmed);
    setIsEditingTitle(false);
  };

  const activeModeObj =
    MODE_OPTIONS.find((m) => m.id === viewMode) || MODE_OPTIONS[0];
  const ActiveModeIcon = activeModeObj.icon;

  const hasActiveFilter =
    searchQuery.trim() !== '' || selectedCategory !== 'Todas';

  const isCloudOnline = firebaseLoggedIn || cloudConnected;

  // Dynamic Island Minimized Pill (+ Hover Edge temporary expansion without pushing viewport)
  if (isMinimized && !hoverExpanded) {
    return (
      <>
        {/* Invisible top edge hover strip */}
        <div
          onMouseEnter={() => setHoverExpanded(true)}
          className="fixed top-0 inset-x-0 h-2.5 z-40"
        />

        {/* Dynamic Island Floating Pill */}
        <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-white/15 shadow-2xl backdrop-blur-xl text-xs text-zinc-200 select-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1.5 pr-1.5 border-r border-white/10">
            <ActiveModeIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-white hidden sm:inline">
              {activeModeObj.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Buscar ou filtrar (⌘K)"
          >
            <Search className="w-3 h-3 text-indigo-400" />
            <span className="font-mono text-[11px]">⌘K</span>
            {hasActiveFilter && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>

          <span className="text-zinc-600">•</span>

          <button
            type="button"
            onClick={onToggleMinimized}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Expandir Barra Superior (⌘M)"
          >
            <span className="text-[11px]">Expandir</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <header
      onMouseLeave={() => {
        if (isMinimized && hoverExpanded && !isSystemPopoverOpen) {
          setHoverExpanded(false);
        }
      }}
      className={`${
        isMinimized && hoverExpanded
          ? 'fixed top-0 inset-x-0 z-50 shadow-2xl'
          : 'relative z-40 shrink-0'
      } h-14 px-3 sm:px-5 bg-zinc-950/85 border-b border-white/10 backdrop-blur-xl flex items-center justify-between gap-2 select-none`}
    >
      {/* LEFT: Dynamic Mode Icon + Editable Hub Title */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
          <ActiveModeIcon className="w-4 h-4" />
        </div>

        <div className="min-w-0 hidden sm:block">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') {
                  setDraftTitle(hubTitle);
                  setIsEditingTitle(false);
                }
              }}
              maxLength={36}
              className="w-40 sm:w-52 px-2 py-0.5 rounded bg-zinc-900 border border-indigo-500/60 text-xs sm:text-sm font-display font-bold text-white focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-left rounded px-1 -mx-1 py-0.5 hover:bg-white/5 transition-colors"
              title="Clique para renomear o Hub"
            >
              <span className="font-display font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-[130px] md:max-w-[180px] lg:max-w-[230px]">
                {hubTitle}
              </span>
              <span className="hidden xl:inline-block text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                {totalAppsCount}/40
              </span>
            </button>
          )}
        </div>
      </div>

      {/* CENTER: 4-Mode Segmented Switcher + Compact Unified Command Palette Trigger */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {/* Segmented Mode Selector */}
        <nav
          aria-label="Modos de visualização"
          className="flex items-center bg-zinc-900/90 p-0.5 sm:p-1 rounded-lg border border-white/10"
        >
          {MODE_OPTIONS.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id)}
                className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                title={`${mode.label} (Atalho: ${mode.shortcut})`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">{mode.label}</span>
                <span className="hidden sm:inline md:hidden">{mode.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Compact Unified Command Palette Trigger */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
              hasActiveFilter
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                : 'bg-zinc-900/80 hover:bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Abrir Command Palette Unificada (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden lg:inline truncate max-w-[150px]">
              {hasActiveFilter
                ? `${selectedCategory !== 'Todas' ? selectedCategory : ''}${
                    searchQuery ? ` "${searchQuery}"` : ''
                  }`.trim()
                : 'Buscar ou filtrar...'}
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-800/90 border border-white/10 font-mono text-[10px] text-zinc-300">
              ⌘K
            </kbd>
          </button>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onClearFilter}
              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-rose-500/25 border border-indigo-500/30 hover:border-rose-500/40 text-indigo-200 hover:text-rose-200 transition-colors"
              title="Limpar filtro ativo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Smart Grouping (System Popover + Organize + Primary CTA + Minimize) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* System & Appearance Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsSystemPopoverOpen((prev) => !prev)}
            className={`relative p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs ${
              isSystemPopoverOpen
                ? 'bg-white/15 border-white/25 text-white'
                : 'bg-zinc-900/80 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
            }`}
            title="Sistema, Aparência e Sincronização"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {/* Sync Status Dot */}
            <span
              className={`w-2 h-2 rounded-full ${
                firebaseSyncing
                  ? 'bg-amber-400 animate-ping'
                  : isCloudOnline
                    ? 'bg-emerald-400'
                    : 'bg-zinc-500'
              }`}
            />
          </button>

          {isSystemPopoverOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl backdrop-blur-xl p-4 text-xs text-zinc-200 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-100">
              {/* Theme Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Tema de Fundo
                  </span>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">
                    {wallpaperTheme}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {THEME_OPTIONS.map((t) => {
                    const active = wallpaperTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onWallpaperChange(t.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                          active
                            ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                            : 'bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-sm bg-gradient-to-br ${t.preview} border border-white/20 shrink-0`}
                        />
                        <span className="truncate font-medium">{t.label}</span>
                        {active && <Check className="w-3 h-3 text-indigo-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density / Scale Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                    Densidade / Escala
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-white/10">
                  {DENSITY_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onGridDensityChange(d.id)}
                      className={`py-1 rounded text-[11px] font-medium transition-colors ${
                        gridDensity === d.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Launch Mode Toggle */}
              {onToggleDirectLaunchMode && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Abertura Direta (1-Clique)
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Pula o cartão Spotlight ao clicar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleDirectLaunchMode}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold border transition-colors ${
                      directLaunchMode
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-900 text-zinc-400 border-white/10'
                    }`}
                  >
                    {directLaunchMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}

              {/* Cloud Sync & Backup + PWA */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Status de Dados:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono font-medium ${
                      isCloudOnline ? 'text-emerald-400' : 'text-zinc-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        firebaseSyncing
                          ? 'bg-amber-400 animate-ping'
                          : isCloudOnline
                            ? 'bg-emerald-400'
                            : 'bg-zinc-500'
                      }`}
                    />
                    {firebaseSyncing
                      ? 'Sync...'
                      : isCloudOnline
                        ? 'Online (Cloud)'
                        : 'Local (Storage)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSystemPopoverOpen(false);
                      onOpenCloudSync();
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Backup & Nuvem</span>
                  </button>
                  <PWAInstallButton compact />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Organizar (Edit Slots Toggle) */}
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isEditMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm'
              : 'bg-zinc-900/80 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
          }`}
          title="Alternar modo de organização e troca rápida de slots"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">
            {isEditMode ? 'Concluir' : 'Organizar'}
          </span>
        </button>

        {/* Primary CTA: + Novo Web App */}
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Novo Web App</span>
        </button>

        {/* Minimize to Dynamic Island (Cmd/Ctrl + M) */}
        <button
          type="button"
          onClick={onToggleMinimized}
          className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          title={
            isMinimized
              ? 'Fixar Barra Superior (⌘M)'
              : 'Recolher para Dynamic Island (⌘M)'
          }
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
