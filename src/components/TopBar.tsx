import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Cloud,
  LayoutGrid,
  Check,
  Edit3,
  Palette,
  ExternalLink,
  Eye,
  X,
  RefreshCw,
  HardDrive,
  Orbit,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  APP_CATEGORIES,
  ClickBehavior,
  GridColumnsPerRow,
  GridScale,
  LauncherViewMode,
  SyncStatus,
  WALLPAPER_THEMES,
  WallpaperTheme,
} from '../types/launcher';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  hubTitle: string;
  onUpdateHubTitle: (newTitle: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  clickBehavior: ClickBehavior;
  onToggleClickBehavior: (behavior: ClickBehavior) => void;
  viewMode: LauncherViewMode;
  onChangeViewMode: (mode: LauncherViewMode) => void;
  gridColumns: GridColumnsPerRow;
  onChangeGridColumns: (cols: GridColumnsPerRow) => void;
  gridScale: GridScale;
  onChangeGridScale: (scale: GridScale) => void;
  theme: WallpaperTheme;
  onChangeTheme: (theme: WallpaperTheme) => void;
  syncStatus: SyncStatus;
  isOrganizeMode: boolean;
  onToggleOrganizeMode: () => void;
  onOpenNewAppModal: () => void;
  onOpenCloudModal: () => void;
  userEmail?: string | null;
  totalAppsCount: number;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  hubTitle,
  onUpdateHubTitle,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  clickBehavior,
  onToggleClickBehavior,
  viewMode,
  onChangeViewMode,
  gridColumns,
  onChangeGridColumns,
  gridScale,
  onChangeGridScale,
  theme,
  onChangeTheme,
  syncStatus,
  isOrganizeMode,
  onToggleOrganizeMode,
  onOpenNewAppModal,
  onOpenCloudModal,
  userEmail,
  totalAppsCount,
  isMinimized,
  onToggleMinimize,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(hubTitle);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const gridMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftTitle(hubTitle);
  }, [hubTitle]);

  // Global Ctrl+K / Cmd+K shortcut to focus quick search & Ctrl+M / Cmd+M to toggle minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onToggleMinimize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleMinimize]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target as Node)
      ) {
        setIsThemeMenuOpen(false);
      }
      if (
        gridMenuRef.current &&
        !gridMenuRef.current.contains(e.target as Node)
      ) {
        setIsGridMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitTitle = () => {
    const trimmed = draftTitle.trim();
    if (trimmed) {
      onUpdateHubTitle(trimmed);
    } else {
      setDraftTitle(hubTitle);
    }
    setIsEditingTitle(false);
  };

  const renderSyncBadge = () => {
    if (syncStatus === 'syncing') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium whitespace-nowrap">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span className="hidden sm:inline">Sync</span>
        </span>
      );
    }
    if (syncStatus === 'online') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-medium whitespace-nowrap">
          <Cloud className="w-3 h-3" />
          <span className="hidden sm:inline">Online</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">
        <HardDrive className="w-3 h-3" />
        <span className="hidden sm:inline">Local</span>
      </span>
    );
  };

  if (isMinimized) {
    return (
      <header className="relative z-30 w-full px-2 sm:px-4 pt-1.5 pb-0.5 shrink-0 flex justify-center">
        <div className="w-auto max-w-[98vw] rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl px-2.5 sm:px-3.5 py-1.5 flex items-center gap-1.5 sm:gap-2.5 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Logo & Title */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 p-px shadow-sm shrink-0">
              <div className="w-full h-full bg-slate-950/90 rounded-[7px] flex items-center justify-center">
                {viewMode === 'sphere' ? (
                  <Orbit className="w-3 h-3 text-cyan-300" />
                ) : (
                  <LayoutGrid className="w-3 h-3 text-indigo-300" />
                )}
              </div>
            </div>
            <span className="font-display font-semibold text-xs text-white tracking-tight truncate max-w-[100px] sm:max-w-[170px]">
              {hubTitle}
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
              {totalAppsCount} apps
            </span>
          </div>

          <div className="w-px h-4 bg-white/15 shrink-0" />

          {/* Segmented View Switcher: Grid | Esfera */}
          <div
            role="group"
            aria-label="Modo de visualização"
            className="flex items-center bg-slate-950/85 p-0.5 rounded-lg border border-white/10 shrink-0"
          >
            <button
              type="button"
              onClick={() => onChangeViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              title="Visualização em Grid"
              className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-2.5 h-2.5" />
              <span className="hidden xs:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('sphere')}
              aria-pressed={viewMode === 'sphere'}
              title="Visualização em Esfera"
              className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                viewMode === 'sphere'
                  ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Orbit className="w-2.5 h-2.5" />
              <span className="hidden xs:inline">Esfera</span>
            </button>
          </div>

          {/* Quick + Add App */}
          <button
            type="button"
            onClick={onOpenNewAppModal}
            aria-label="Novo Web App"
            title="Adicionar Novo Web App"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-[11px] font-semibold shadow-sm border border-white/15 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Novo App</span>
          </button>

          <PWAInstallButton compact />

          <div className="w-px h-4 bg-white/15 shrink-0" />

          {/* Expand Menu Button */}
          <button
            type="button"
            onClick={onToggleMinimize}
            aria-label="Expandir Menu Completo"
            title="Expandir Menu Completo (⌘M)"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white text-[11px] font-medium transition-all cursor-pointer shrink-0"
          >
            <ChevronDown className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-[11px] font-medium hidden xs:inline">Expandir Menu</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-30 w-full px-2 sm:px-5 pt-2 pb-1 shrink-0">
      <div className="w-full max-w-[1600px] mx-auto rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl px-2.5 sm:px-3.5 py-2 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2">
        {/* Left Zone: Brand + Editable Title + View Mode Switcher + Minimize Toggle */}
        <div className="flex items-center justify-between w-full xl:w-auto gap-2 min-w-0 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 p-px shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950/90 rounded-[11px] flex items-center justify-center">
                {viewMode === 'sphere' ? (
                  <Orbit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-300" />
                )}
              </div>
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-1">
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
                  aria-label="Editar título da galeria"
                  maxLength={80}
                  autoFocus
                  className="bg-slate-950/90 text-white font-display font-semibold text-xs sm:text-sm px-2 py-1 rounded-lg border border-indigo-500/60 focus:outline-none w-36 sm:w-48"
                />
                <button
                  type="button"
                  onClick={commitTitle}
                  aria-label="Salvar título da galeria"
                  className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                title="Clique para renomear sua galeria"
                className="group flex items-center gap-1 text-left rounded-lg px-1.5 py-0.5 -ml-1 hover:bg-white/5 transition-colors max-w-[145px] sm:max-w-[200px] cursor-pointer"
              >
                <span className="font-display font-semibold text-xs sm:text-sm text-white tracking-tight truncate">
                  {hubTitle}
                </span>
                <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Segmented View Switcher: Grid | Esfera */}
            <div
              role="group"
              aria-label="Modo de visualização"
              className="flex items-center bg-slate-950/85 p-0.5 rounded-xl border border-white/10 shrink-0"
            >
              <button
                type="button"
                onClick={() => onChangeViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('sphere')}
                aria-pressed={viewMode === 'sphere'}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'sphere'
                    ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Orbit className="w-3 h-3" />
                <span>Esfera</span>
              </button>
            </div>

            {/* Quick Minimize Toggle Button right in Row 1 */}
            <button
              type="button"
              onClick={onToggleMinimize}
              aria-label="Minimizar Menu"
              title="Minimizar Menu para liberar espaço (⌘M)"
              className="inline-flex items-center justify-center p-1.5 sm:px-2 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer shrink-0"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline ml-1">Minimizar</span>
            </button>
          </div>
        </div>

        {/* Center Zone: Raycast-style Search Bar + Category Filter */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px] max-w-md order-3 xl:order-2 w-full xl:w-auto">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar apps ou tags..."
              aria-label="Pesquisar aplicativos"
              className="w-full bg-slate-950/75 text-slate-100 placeholder-slate-400 text-xs pl-8 pr-10 py-1.5 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:bg-slate-950 focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filtrar por categoria"
            className="bg-slate-950/75 text-slate-200 text-xs py-1.5 px-2 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:outline-none cursor-pointer shrink-0"
          >
            <option value="ALL">Todas Tags</option>
            {APP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Right Zone: Grid Size (4/6/8 per row), Click Mode, Theme, Organize, Cloud & + Novo Web App */}
        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-1.5 w-full xl:w-auto order-2 xl:order-3 shrink-0">
          {/* Grid Columns & Size Control (4 / 6 / 8 apps per row) */}
          {viewMode === 'grid' && (
            <div className="relative" ref={gridMenuRef}>
              <button
                type="button"
                onClick={() => setIsGridMenuOpen((prev) => !prev)}
                aria-label="Tamanho do Grid e Apps por Linha"
                title="Ajustar Tamanho do Grid (4, 6 ou 8 apps por linha)"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3 text-cyan-300" />
                <span className="font-mono">{gridColumns}/linha</span>
              </button>

              {isGridMenuOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-2.5 z-50 space-y-2.5">
                  <div>
                    <div className="px-1 pb-1.5 text-[11px] font-semibold text-slate-300">
                      Apps por Linha (Página Única Sem Rolagem)
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {([2, 3, 4, 6, 8] as GridColumnsPerRow[]).map((cols) => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => {
                            onChangeGridColumns(cols);
                            setIsGridMenuOpen(false);
                          }}
                          className={`py-1.5 px-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                            gridColumns === cols
                              ? 'bg-indigo-500/25 border-indigo-400/50 text-white'
                              : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {cols}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="px-1 pb-1.5 text-[11px] font-semibold text-slate-300">
                      Tamanho do Grid / Ícones
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onChangeGridScale('xs')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          gridScale === 'xs'
                            ? 'bg-cyan-500/25 border-cyan-400/50 text-white'
                            : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Mini
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeGridScale('compact')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          gridScale === 'compact'
                            ? 'bg-cyan-500/25 border-cyan-400/50 text-white'
                            : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Compacto
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeGridScale('normal')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          gridScale === 'normal'
                            ? 'bg-cyan-500/25 border-cyan-400/50 text-white'
                            : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Normal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Click Behavior Selector: Preview vs New Tab */}
          <div
            role="group"
            aria-label="Comportamento do clique principal"
            className="hidden lg:flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-xs"
          >
            <button
              type="button"
              onClick={() => onToggleClickBehavior('preview')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                clickBehavior === 'preview'
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleClickBehavior('new_tab')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                clickBehavior === 'new_tab'
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              <span>Nova Aba</span>
            </button>
          </div>

          {/* Wallpaper Theme Picker */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              aria-label="Trocar tema do wallpaper"
              title="Trocar Tema do Wallpaper"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-violet-300" />
              <span className="hidden 2xl:inline">
                {WALLPAPER_THEMES[theme].name}
              </span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-2 z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                  Tema do Ambiente (Wallpaper)
                </div>
                {(
                  Object.keys(WALLPAPER_THEMES) as Array<
                    keyof typeof WALLPAPER_THEMES
                  >
                ).map((tKey) => {
                  const item = WALLPAPER_THEMES[tKey];
                  const active = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => {
                        onChangeTheme(tKey);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                          : 'hover:bg-white/5 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{item.name}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          {item.description}
                        </div>
                      </div>
                      {active && (
                        <Check className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Organize / Edit Grid Mode Toggle */}
          {viewMode === 'grid' && (
            <button
              type="button"
              onClick={onToggleOrganizeMode}
              aria-label="Organizar Grid"
              aria-pressed={isOrganizeMode}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                isOrganizeMode
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isOrganizeMode ? 'Organizando' : 'Organizar'}
              </span>
            </button>
          )}

          {/* Cloud Sync & Status Button */}
          <button
            type="button"
            onClick={onOpenCloudModal}
            aria-label="Sincronização e Nuvem"
            title={
              userEmail
                ? `Conectado como ${userEmail} — Clique para Sincronização & Nuvem`
                : 'Sincronização & Nuvem'
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            {renderSyncBadge()}
            <span className="text-white/20">·</span>
            <span className="text-[11px] font-medium text-indigo-300 whitespace-nowrap">
              Nuvem
            </span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Primary Action Button: + Novo Web App */}
          <button
            type="button"
            onClick={onOpenNewAppModal}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 border border-white/15 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Web App</span>
          </button>
        </div>
      </div>
    </header>
  );
};
