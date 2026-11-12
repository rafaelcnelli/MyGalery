import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  X,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { WebAppItem } from '../types/launcher';
import { AppLogo } from './AppLogo';

interface LivePreviewModalProps {
  app: WebAppItem | null;
  onClose: () => void;
}

type ViewportPreset = 'desktop' | 'tablet' | 'mobile';

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  app,
  onClose,
}) => {
  const [viewport, setViewport] = useState<ViewportPreset>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showXFrameNotice, setShowXFrameNotice] = useState(true);

  if (!app) return null;

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizador ao vivo de ${app.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg p-0 sm:p-4 animate-fadeIn"
    >
      <div
        className={`relative flex flex-col bg-slate-900/95 border-0 sm:border border-white/15 shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-screen h-dvh rounded-none'
            : 'w-screen h-dvh rounded-none sm:rounded-2xl sm:w-[92vw] sm:h-[88vh]'
        }`}
      >
        {/* Top Bar: Compact Full-Screen Header on Mobile + macOS Window Bar on Desktop */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-950/95 border-b border-white/10 shrink-0">
          {/* Left: Close/Traffic Lights + App Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar para a galeria"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Desktop Traffic Lights */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar janela de preview"
                title="Fechar (Esc)"
                className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center group cursor-pointer"
              >
                <X className="w-2.5 h-2.5 text-rose-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                aria-label="Restaurar viewport padrão"
                title="Restaurar Viewport Desktop"
                className="w-3.5 h-3.5 rounded-full bg-amber-400 hover:bg-amber-300 flex items-center justify-center group cursor-pointer"
              >
                <Minimize2 className="w-2.5 h-2.5 text-amber-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                aria-label="Alternar tela cheia"
                title="Alternar Tela Cheia"
                className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center group cursor-pointer"
              >
                <Maximize2 className="w-2.5 h-2.5 text-emerald-950 opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <AppLogo
                name={app.name}
                url={app.url}
                accentColor={app.accentColor}
                customLogoUrl={
                  app.customLogoUrl === 'monogram://fallback'
                    ? ''
                    : app.customLogoUrl
                }
                forceMonogram={app.customLogoUrl === 'monogram://fallback'}
                size="xs"
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-white truncate">
                  {app.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-mono truncate max-w-[140px] sm:max-w-[300px]">
                  <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{app.url}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Viewport Switcher (Desktop Only — hidden on Mobile since app covers full screen) */}
          <div
            role="group"
            aria-label="Controles de Viewport"
            className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10"
          >
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (768px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390×844)</span>
            </button>
          </div>

          {/* Right: Reload Iframe & Open in External Browser */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReload}
              aria-label="Recarregar iframe"
              title="Recarregar página"
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Recarregar</span>
            </button>

            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors whitespace-nowrap"
            >
              <span className="hidden xs:inline">Navegador</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Friendly X-Frame-Options Security Helper Bar (Desktop only or dismissible) */}
        {showXFrameNotice && (
          <div className="hidden sm:flex bg-slate-900/95 border-b border-white/10 px-4 py-2 items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                Caso o site possua política de segurança{' '}
                <code className="font-mono text-amber-300">X-Frame-Options</code>{' '}
                que bloqueie exibição interna, acesse diretamente em uma nova guia.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-200 font-semibold underline underline-offset-2 whitespace-nowrap"
              >
                Abrir externamente ↗
              </a>
              <button
                type="button"
                onClick={() => setShowXFrameNotice(false)}
                aria-label="Ocultar aviso de iframe"
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Viewport Stage: Full-bleed on Mobile, Responsive Frame on Desktop */}
        <div className="flex-1 w-full bg-slate-950/90 overflow-hidden flex items-center justify-center p-0 sm:p-4">
          {/* Mobile Always Renders Full-Screen Edge-to-Edge */}
          <div className="w-full h-full sm:hidden bg-white">
            <iframe
              key={`mobile-${iframeKey}`}
              src={app.url}
              title={`Preview de ${app.name}`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          {/* Desktop Viewports */}
          <div className="hidden sm:flex w-full h-full items-center justify-center">
            {viewport === 'desktop' && (
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-white shadow-2xl">
                <iframe
                  key={iframeKey}
                  src={app.url}
                  title={`Preview de ${app.name}`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            )}

            {viewport === 'tablet' && (
              <div className="w-[768px] max-w-full h-full rounded-3xl p-3 bg-slate-900 border-2 border-slate-700 shadow-2xl flex flex-col">
                <div className="w-12 h-1 rounded-full bg-slate-700 mx-auto mb-2 shrink-0" />
                <div className="flex-1 w-full rounded-2xl overflow-hidden bg-white">
                  <iframe
                    key={iframeKey}
                    src={app.url}
                    title={`Preview Tablet de ${app.name}`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              </div>
            )}

            {viewport === 'mobile' && (
              <div
                data-testid="mobile-viewport-frame"
                className="w-[390px] h-[844px] max-h-full rounded-[44px] p-3 bg-slate-900 border-[4px] border-slate-700 shadow-2xl flex flex-col relative shrink-0"
              >
                <div className="w-24 h-5 rounded-full bg-slate-950 mx-auto mb-2 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                </div>
                <div className="flex-1 w-full rounded-[32px] overflow-hidden bg-white">
                  <iframe
                    key={iframeKey}
                    src={app.url}
                    title={`Preview Mobile de ${app.name}`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
                <div className="w-32 h-1 rounded-full bg-slate-600 mx-auto mt-2 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
