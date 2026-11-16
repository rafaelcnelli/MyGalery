import React, { useEffect, useState } from 'react';
import {
  Maximize2,
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  Check,
  ArrowUpRightSquare,
} from 'lucide-react';
import { WebAppItem } from '../types/launcher';
import { formatSlotNumber } from '../utils/launcherLogic';

export interface ContextMenuState {
  app: WebAppItem;
  x: number;
  y: number;
}

interface AppContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
  onOpenInternal: (app: WebAppItem) => void;
  onOpenExternal: (app: WebAppItem) => void;
  onEditApp: (app: WebAppItem) => void;
  onToggleExternalOnly: (app: WebAppItem) => void;
  onDeleteApp: (id: string) => void;
}

export const AppContextMenu: React.FC<AppContextMenuProps> = ({
  menu,
  onClose,
  onOpenInternal,
  onOpenExternal,
  onEditApp,
  onToggleExternalOnly,
  onDeleteApp,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const handleGlobalClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const { app, x, y } = menu;
  const menuWidth = 248;
  const menuHeight = 250;
  const safeX =
    typeof window !== 'undefined'
      ? Math.min(x, Math.max(12, window.innerWidth - menuWidth - 12))
      : x;
  const safeY =
    typeof window !== 'undefined'
      ? Math.min(y, Math.max(12, window.innerHeight - menuHeight - 12))
      : y;

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(app.url);
      setCopied(true);
      setTimeout(() => {
        onClose();
      }, 450);
    } catch {
      onClose();
    }
  };

  return (
    <div
      className="fixed z-[70] w-60 rounded-lg bg-zinc-950/95 border border-white/15 shadow-2xl backdrop-blur-xl py-1.5 text-xs text-zinc-200 select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ left: safeX, top: safeY }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between gap-2">
        <span className="font-semibold text-white truncate">{app.name}</span>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">
          #{formatSlotNumber(app.slotIndex)}
        </span>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          type="button"
          onClick={() => {
            onOpenInternal(app);
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-indigo-600/25 hover:text-white transition-colors text-left"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Abrir no Live Preview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenExternal(app);
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/10 hover:text-white transition-colors text-left"
        >
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Abrir em Nova Aba (↗)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onEditApp(app);
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/10 hover:text-white transition-colors text-left"
        >
          <Edit2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Editar App</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onToggleExternalOnly(app);
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-white/10 hover:text-white transition-colors text-left"
        >
          <span className="flex items-center gap-2.5">
            <ArrowUpRightSquare
              className={`w-3.5 h-3.5 shrink-0 ${
                app.openExternalOnly ? 'text-amber-400' : 'text-zinc-400'
              }`}
            />
            <span>Sempre abrir em Nova Aba</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              app.openExternalOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {app.openExternalOnly ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopyUrl}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/10 hover:text-white transition-colors text-left"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 font-medium">URL copiada!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Copiar URL</span>
            </>
          )}
        </button>
      </div>

      {/* Destructive */}
      <div className="pt-1 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            onDeleteApp(app.id);
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors text-left"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span>Limpar Slot #{formatSlotNumber(app.slotIndex)}</span>
        </button>
      </div>
    </div>
  );
};
