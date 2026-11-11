import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={isIOS ? 'Instalar no iOS' : 'Instalar App PWA'}
        title={
          isInstallable
            ? 'Instalar aplicativo na sua Área de Trabalho / Tela Inicial'
            : 'Instalar Web App (PWA) no seu dispositivo'
        }
        className={`inline-flex items-center gap-1.5 ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-[11px]'
        } rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0`}
      >
        <Download className="w-3.5 h-3.5 text-emerald-300" />
        <span className={compact ? 'hidden sm:inline' : 'hidden md:inline'}>
          {isIOS ? 'Instalar no iOS' : 'Instalar App'}
        </span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-slate-900/95 border border-white/15 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3
                    id="pwa-install-title"
                    className="font-display font-semibold text-sm sm:text-base text-white"
                  >
                    Instalar Sonoma Web OS (PWA)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Use como aplicativo nativo em tela cheia e offline
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Fechar guia de instalação"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="rounded-xl bg-slate-950/80 border border-white/10 p-3.5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Smartphone className="w-4 h-4 text-cyan-300" />
                  <span>Como instalar no iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <span>1. Toque no botão</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                      <Share className="w-3 h-3 text-indigo-300" /> Compartilhar
                    </span>
                    <span>na barra do Safari.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span>2. Role para baixo e selecione</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                      <PlusSquare className="w-3 h-3 text-emerald-300" /> Adicionar à Tela de Início
                    </span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="rounded-xl bg-slate-950/80 border border-white/10 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Monitor className="w-4 h-4 text-indigo-300" />
                    <span>No Desktop (Chrome, Edge ou Brave):</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    Clique no ícone de <strong>Instalar Sonoma Web OS</strong> localizado no lado direito da barra de endereços do navegador (ou abra a aplicação em uma nova aba fora do preview para habilitar o botão direto).
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/80 border border-white/10 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Smartphone className="w-4 h-4 text-cyan-300" />
                    <span>No Android / iOS:</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    No Chrome Android, abra o menu <strong>⋮</strong> e toque em <strong>Instalar aplicativo</strong>. No Safari iOS, toque em <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-xl bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-400/40 text-xs font-semibold text-indigo-100 transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
