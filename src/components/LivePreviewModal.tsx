import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Lock,
  Maximize,
  Minimize,
  ArrowUpRightSquare,
} from 'lucide-react';
import { WebAppItem } from '../types/launcher';
import { formatSlotNumber } from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface LivePreviewModalProps {
  app: WebAppItem | null;
  onClose: () => void;
  onOpenExternal: (app: WebAppItem) => void;
  onToggleExternalOnly?: (app: WebAppItem) => void;
}

type ViewportPreset = 'desktop' | 'tablet' | 'mobile';

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  app,
  onClose,
  onOpenExternal,
  onToggleExternalOnly,
}) => {
  const [viewport, setViewport] = useState<ViewportPreset>('desktop');
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!app) return null;

  const viewportWidthClass =
    viewport === 'mobile'
      ? 'w-[375px] max-w-full h-[92%] rounded-2xl border border-white/20 shadow-2xl'
      : viewport === 'tablet'
        ? 'w-[768px] max-w-full h-[94%] rounded-xl border border-white/20 shadow-2xl'
        : 'w-full h-full';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-150 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-5'
      }`}
    >
      <div
        className={`relative flex flex-col bg-zinc-950 border border-white/15 shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none'
            : 'w-full max-w-[1440px] h-[90dvh] rounded-xl'
        }`}
      >
        {/* Browser Top Control Bar */}
        <div className="h-12 px-3 sm:px-4 bg-zinc-900 border-b border-white/10 flex items-center justify-between gap-2 shrink-0 select-none">
          {/* Left: Window Dots + App Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors"
                title="Fechar janela"
              />
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
                title="Alternar Tela Cheia"
              />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <div className="scale-75 -mx-1 shrink-0">
                <AppLogo
                  name={app.name}
                  url={app.url}
                  accentColor={app.accentColor}
                  customLogoUrl={app.customLogoUrl}
                  size="xs"
                />
              </div>
              <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {app.name}
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                #{formatSlotNumber(app.slotIndex)}
              </span>
            </div>
          </div>

          {/* Center: URL Bar + Reload + Viewport Switcher */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xl mx-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-950/90 border border-white/10 text-xs font-mono text-zinc-400 truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{app.url}</span>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
              title="Recarregar Iframe"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Responsive Viewport Presets + Smart Iframe Block Memory Toggle + External */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Viewport Presets */}
            <div className="hidden sm:flex items-center bg-zinc-950 p-0.5 rounded-md border border-white/10">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewport === 'desktop'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewport === 'tablet'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewport === 'mobile'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Smart Iframe Block Memory Toggle */}
            {onToggleExternalOnly && (
              <button
                type="button"
                onClick={() => {
                  onToggleExternalOnly(app);
                  if (!app.openExternalOnly) {
                    onOpenExternal(app);
                    onClose();
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  app.openExternalOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border-amber-500/30'
                }`}
                title="Ativar caso o site possua bloqueio X-Frame-Options"
              >
                <ArrowUpRightSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">
                  Site não carrega? Sempre abrir em Nova Aba
                </span>
                <span className="md:hidden">Sempre ↗</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenExternal(app)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              title="Abrir em Nova Aba (↗)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aba</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
              title={isFullscreen ? 'Restaurar tamanho' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5" />
              ) : (
                <Maximize className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-200 border border-white/10 transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Iframe Stage */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden p-0">
          <div className={`bg-white overflow-hidden transition-all duration-200 ${viewportWidthClass}`}>
            <iframe
              key={`${app.id}-${reloadKey}`}
              src={app.url}
              title={app.name}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
