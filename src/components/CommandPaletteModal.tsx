import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  ExternalLink,
  Maximize2,
  Edit2,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Filter,
  Sparkles,
} from 'lucide-react';
import { AppCategory, CATEGORY_COLORS, WebAppItem } from '../types/launcher';
import { extractHostname, formatSlotNumber, getMatchingAppIds } from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface CommandPaletteModalProps {
  isOpen: boolean;
  apps: WebAppItem[];
  searchQuery: string;
  selectedCategory: AppCategory | 'Todas';
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: AppCategory | 'Todas') => void;
  onClose: () => void;
  onSelectApp: (app: WebAppItem) => void;
  onOpenInternal: (app: WebAppItem) => void;
  onOpenExternal: (app: WebAppItem) => void;
  onEditApp: (app: WebAppItem) => void;
  onCreateNewApp: () => void;
}

const CATEGORIES: (AppCategory | 'Todas')[] = [
  'Todas',
  'SaaS',
  'Produtividade',
  'Utilitário',
  'IA',
  'Game',
  'Social',
  'Cliente',
  'Finanças',
  'Design',
  'DevTools',
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  apps,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onClose,
  onSelectApp,
  onOpenInternal,
  onOpenExternal,
  onEditApp,
  onCreateNewApp,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const matchingIds = useMemo(
    () => getMatchingAppIds(apps, searchQuery, selectedCategory),
    [apps, searchQuery, selectedCategory]
  );

  const filteredApps = useMemo(() => {
    return [...apps]
      .filter((app) => matchingIds.has(app.id))
      .sort((a, b) => a.slotIndex - b.slotIndex);
  }, [apps, matchingIds]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredApps.length > 0 ? (prev + 1) % filteredApps.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredApps.length > 0
          ? (prev - 1 + filteredApps.length) % filteredApps.length
          : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeApp = filteredApps[selectedIndex];
      if (activeApp) {
        if (e.metaKey || e.ctrlKey || activeApp.openExternalOnly) {
          onOpenExternal(activeApp);
        } else if (e.shiftKey) {
          onSelectApp(activeApp);
        } else {
          onOpenInternal(activeApp);
        }
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const hasFilter = searchQuery.trim() !== '' || selectedCategory !== 'Todas';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[82dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-zinc-900/60">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, URL, categoria ou slot (ex: #01, #14)..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('Todas');
                inputRef.current?.focus();
              }}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 shrink-0 transition-colors"
            >
              Limpar filtro
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clickable 10 Category Filter Bar */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-zinc-900/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1 shrink-0">
            <Filter className="w-3 h-3" /> Tags:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const catColor = cat !== 'Todas' ? CATEGORY_COLORS[cat] : '#6366f1';
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600/25 text-white border-indigo-500/60 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 border-white/5 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {cat !== 'Todas' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: catColor }}
                  />
                )}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          {filteredApps.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  Nenhum aplicativo encontrado para o filtro atual
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Tente outro termo ou cadastre um novo Web App na sua grade de 40 slots.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateNewApp();
                }}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> + Cadastrar Novo Web App
              </button>
            </div>
          ) : (
            filteredApps.map((app, index) => {
              const isSelected = index === selectedIndex;
              const slotNum = formatSlotNumber(app.slotIndex);
              const catColor = CATEGORY_COLORS[app.category];

              return (
                <div
                  key={app.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    if (app.openExternalOnly) {
                      onOpenExternal(app);
                    } else {
                      onOpenInternal(app);
                    }
                    onClose();
                  }}
                  className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40'
                      : 'border border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <AppLogo
                        name={app.name}
                        url={app.url}
                        accentColor={app.accentColor}
                        customLogoUrl={app.customLogoUrl}
                        size="xs"
                      />
                      {app.openExternalOnly && (
                        <span
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-sm bg-amber-500 text-zinc-950 flex items-center justify-center text-[9px] font-bold shadow"
                          title="Sempre abre em Nova Aba"
                        >
                          ↗
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          #{slotNum}
                        </span>
                        <span className="text-sm font-medium text-zinc-100 truncate">
                          {app.name}
                        </span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${catColor}18`,
                            color: catColor,
                            borderColor: `${catColor}40`,
                          }}
                        >
                          {app.category}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                        {extractHostname(app.url)} — {app.url}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApp(app);
                        onClose();
                      }}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 border border-white/10 transition-colors"
                      title="Ver Detalhes (Spotlight)"
                    >
                      Detalhes
                    </button>
                    {!app.openExternalOnly && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInternal(app);
                          onClose();
                        }}
                        className="p-1.5 rounded bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-colors"
                        title="Abrir no Live Preview (Enter)"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenExternal(app);
                        onClose();
                      }}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Abrir em Nova Aba (⌘/Ctrl + Enter)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditApp(app);
                        onClose();
                      }}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                      title="Editar App"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-300">
                <ArrowUp className="w-2.5 h-2.5 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-300">
                <ArrowDown className="w-2.5 h-2.5 inline" />
              </kbd>
              Navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-300">
                <CornerDownLeft className="w-2.5 h-2.5 inline mr-0.5" /> Enter
              </kbd>
              Abrir App
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-300">
                ⌘/Ctrl + Enter
              </kbd>
              Nova Aba
            </span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            {filteredApps.length} de {apps.length} apps ativos
          </span>
        </div>
      </div>
    </div>
  );
};
