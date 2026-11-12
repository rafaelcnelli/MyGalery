import React, { useEffect } from 'react';
import {
  Edit2,
  ExternalLink,
  Smartphone,
  X,
  Globe,
} from 'lucide-react';
import { ACCENT_COLOR_MAP, WebAppItem } from '../types/launcher';
import { extractHostname } from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface AppSpotlightModalProps {
  app: WebAppItem | null;
  onClose: () => void;
  onOpenInApp: (app: WebAppItem) => void;
  onOpenEdit: (app: WebAppItem) => void;
}

export const AppSpotlightModal: React.FC<AppSpotlightModalProps> = ({
  app,
  onClose,
  onOpenInApp,
  onOpenEdit,
}) => {
  useEffect(() => {
    if (!app) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [app, onClose]);

  if (!app) return null;

  const accent =
    ACCENT_COLOR_MAP[app.accentColor] || ACCENT_COLOR_MAP.indigo;
  const hostname = extractHostname(app.url) || app.url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spotlight-app-title"
      onClick={onClose}
      className="fixed inset-0 z-40 flex flex-col items-center justify-end sm:justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150"
    >
      {/* Highlighted App Spotlight Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        data-testid="app-spotlight-card"
        className="relative w-full max-w-md rounded-3xl bg-slate-900/95 border border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 text-slate-100 flex flex-col gap-5 overflow-hidden"
      >
        {/* Subtle Ambient Accent Glow Behind Highlighted App */}
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-br ${accent.bgGradient} opacity-20 blur-3xl`}
        />

        {/* Top Bar: Slot / Category Info + Prominent Edit Icon & Close Button */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">
              #{String(app.slotIndex).padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-indigo-300">{app.category}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Edit Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(app);
              }}
              data-testid="spotlight-edit-button"
              aria-label={`Editar ${app.name}`}
              title="Editar aplicativo"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Editar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar destaque"
              title="Fechar (Esc)"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Highlighted App Icon (with quick Edit badge) + Title + Hostname */}
        <div className="relative z-10 flex flex-col items-center text-center gap-3 py-1">
          <div className="relative group">
            <div className="p-1.5 rounded-3xl bg-white/[0.04] border border-white/15 shadow-2xl">
              <AppLogo
                name={app.name}
                url={app.url}
                accentColor={app.accentColor}
                customLogoUrl={app.customLogoUrl}
                size="lg"
              />
            </div>

            {/* Floating Edit Icon Badge directly on the highlighted App Icon */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(app);
              }}
              aria-label={`Editar ícone e dados de ${app.name}`}
              title="Editar App"
              className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-slate-900 shadow-lg flex items-center justify-center transition-transform active:scale-90 cursor-pointer z-20"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-w-full px-2">
            <h2
              id="spotlight-app-title"
              className="font-display font-bold text-lg sm:text-xl text-white tracking-tight truncate"
            >
              {app.name}
            </h2>

            <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono max-w-full">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[260px]">{hostname}</span>
            </div>

            <p className="text-[11px] text-slate-400/90 font-mono truncate max-w-[280px] mx-auto pt-0.5">
              {app.url}
            </p>
          </div>
        </div>

        {/* Bottom Action Buttons: Open inside App OR Open Externally in Browser */}
        <div className="relative z-10 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInApp(app);
            }}
            data-testid="spotlight-open-in-app"
            className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 border border-white/15 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Abrir pelo App</span>
          </button>

          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClose()}
            data-testid="spotlight-open-external"
            className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 hover:text-white text-xs sm:text-sm font-semibold border border-white/15 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>Abrir no Navegador</span>
          </a>
        </div>
      </div>
    </div>
  );
};
