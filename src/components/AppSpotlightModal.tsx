import React from 'react';
import {
  X,
  ExternalLink,
  Maximize2,
  Edit2,
  Globe,
  Layers,
  Hash,
  ArrowUpRightSquare,
  CheckCircle2,
} from 'lucide-react';
import {
  WebAppItem,
  ACCENT_COLOR_MAP,
  CATEGORY_COLORS,
} from '../types/launcher';
import { extractHostname, formatSlotNumber } from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface AppSpotlightModalProps {
  app: WebAppItem | null;
  onClose: () => void;
  onOpenInternal: (app: WebAppItem) => void;
  onOpenExternal: (app: WebAppItem) => void;
  onEdit: (app: WebAppItem) => void;
  onToggleExternalOnly?: (app: WebAppItem) => void;
}

export const AppSpotlightModal: React.FC<AppSpotlightModalProps> = ({
  app,
  onClose,
  onOpenInternal,
  onOpenExternal,
  onEdit,
  onToggleExternalOnly,
}) => {
  if (!app) return null;

  const colorStyle = ACCENT_COLOR_MAP[app.accentColor] || ACCENT_COLOR_MAP.indigo;
  const categoryColor = CATEGORY_COLORS[app.category] || '#6366f1';
  const hostname = extractHostname(app.url);
  const slotNum = formatSlotNumber(app.slotIndex);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl overflow-hidden p-6 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colorStyle.bgGradient}`}
        />

        {/* Close & Edit Buttons */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-semibold text-indigo-300">
              <Hash className="w-3 h-3" /> Slot #{slotNum}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border"
              style={{
                backgroundColor: `${categoryColor}18`,
                color: categoryColor,
                borderColor: `${categoryColor}40`,
              }}
            >
              <Layers className="w-3 h-3" />
              {app.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(app);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
              title="Editar Aplicativo"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Identity */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <AppLogo
              name={app.name}
              url={app.url}
              accentColor={app.accentColor}
              customLogoUrl={app.customLogoUrl}
              size="lg"
            />
            {app.openExternalOnly && (
              <span
                className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono text-[10px] font-bold shadow"
                title="Configurado para abrir sempre em Nova Aba"
              >
                ↗
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-display font-bold text-white tracking-tight truncate">
              {app.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-1 truncate">
              <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{hostname}</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
              {app.url}
            </p>
          </div>
        </div>

        {/* Iframe / Launch Mode Status Pill */}
        <div className="mb-5 p-3 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {app.openExternalOnly ? (
              <ArrowUpRightSquare className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200">
                {app.openExternalOnly
                  ? 'Modo Direto: Sempre em Nova Aba (↗)'
                  : 'Live Preview Interno Habilitado'}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {app.openExternalOnly
                  ? 'Pula o iframe interno para evitar bloqueio X-Frame-Options'
                  : 'Abre na janela estilo macOS/Mobile dentro do Hub'}
              </p>
            </div>
          </div>

          {onToggleExternalOnly && (
            <button
              type="button"
              onClick={() => onToggleExternalOnly(app)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border shrink-0 transition-colors ${
                app.openExternalOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300 border-white/10 hover:bg-zinc-700'
              }`}
            >
              {app.openExternalOnly ? 'Usar Iframe' : 'Forçar ↗'}
            </button>
          )}
        </div>

        {/* Launch CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInternal(app);
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.99]"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Abrir pelo App</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenExternal(app);
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-medium text-xs border border-white/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <ExternalLink className="w-4 h-4 text-zinc-400" />
            <span>Abrir no Navegador (↗)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
