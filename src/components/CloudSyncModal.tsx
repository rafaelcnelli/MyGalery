import React, { useState, useRef } from 'react';
import {
  Cloud,
  RefreshCw,
  Download,
  Upload,
  LogIn,
  LogOut,
  CheckCircle2,
  X,
  Link2,
  BookOpen,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LauncherState, SyncStatus } from '../types/launcher';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignInGoogle: () => Promise<void>;
  onSignOutGoogle: () => Promise<void>;
  cloudRestUrl: string;
  onSaveCloudRestUrl: (url: string) => void;
  onSyncNow: () => Promise<void>;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  launcherState: LauncherState;
  onImportBackup: (importedState: Partial<LauncherState>) => void;
  onRestoreDemoApps: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInGoogle,
  onSignOutGoogle,
  cloudRestUrl,
  onSaveCloudRestUrl,
  onSyncNow,
  syncStatus,
  lastSyncedAt,
  launcherState,
  onImportBackup,
  onRestoreDemoApps,
}) => {
  const [draftRestUrl, setDraftRestUrl] = useState(cloudRestUrl);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveRestEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftRestUrl.trim();
    onSaveCloudRestUrl(cleaned);
    setFeedbackMsg(
      cleaned
        ? 'URL de Sincronização REST salva! Sincronizando dados...'
        : 'Endpoint REST removido (modo local/Firestore ativo).'
    );
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(launcherState, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonoma-web-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedbackMsg('Backup .JSON exportado com sucesso!');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || '{}'));
        if (parsed && Array.isArray(parsed.apps)) {
          onImportBackup(parsed);
          setFeedbackMsg(
            `Backup importado com sucesso (${parsed.apps.length} apps carregados)!`
          );
        } else {
          setFeedbackMsg('Arquivo JSON inválido: propriedade "apps" não encontrada.');
        }
      } catch {
        setFeedbackMsg('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="cloud-sync-modal-title"
                className="font-display font-bold text-lg text-white"
              >
                Nuvem & Backup Multi-Dispositivo
              </h2>
              <p className="text-xs text-slate-400">
                Sincronize sua galeria via Firebase Cloud Auth, REST Endpoint JSON ou arquivo local
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de nuvem"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {feedbackMsg && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-emerald-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section 1: Native Firebase Auth + Cloud Firestore Sync */}
          <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">
                    1. Sincronização Oficial com Google & Cloud Firestore
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conecte sua conta Google para salvar automaticamente seus apps e posições (slots 0–39) no Firestore.
                </p>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-300 font-mono">
                    {currentUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={onSignOutGoogle}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onSignInGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Custom Cloud Sync REST API (Firebase Realtime DB / Endpoint JSON) */}
          <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  2. Cloud Sync REST API (Firebase Realtime Database / Endpoint JSON)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Opcionalmente, conecte uma URL REST JSON compatível para executar{' '}
                <code className="font-mono text-cyan-300">GET</code> ao abrir e{' '}
                <code className="font-mono text-cyan-300">PUT</code> automático a cada alteração.
              </p>
            </div>

            <form onSubmit={handleSaveRestEndpoint} className="flex gap-2">
              <input
                type="url"
                value={draftRestUrl}
                onChange={(e) => setDraftRestUrl(e.target.value)}
                placeholder="https://meu-projeto-default-rtdb.firebaseio.com/galeria.json"
                aria-label="URL de Banco na Nuvem REST"
                className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400/60 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                Salvar URL
              </button>
            </form>

            {/* Quick 3-Step Guide */}
            <div className="rounded-xl bg-slate-900/90 border border-white/5 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Guia Rápido: Como criar seu link gratuito no Firebase em 1 minuto</span>
              </div>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  Acesse o{' '}
                  <span className="text-slate-200 font-medium">
                    Firebase Console
                  </span>{' '}
                  crie um projeto gratuito e ative o menu{' '}
                  <span className="text-slate-200 font-medium">
                    Realtime Database
                  </span>
                  .
                </li>
                <li>
                  Inicie no{' '}
                  <span className="text-slate-200 font-medium">Modo de Teste</span>{' '}
                  (regras com <code className="font-mono text-amber-300">.read: true, .write: true</code>) e copie a URL base do banco.
                </li>
                <li>
                  Cole a URL acima adicionando{' '}
                  <code className="font-mono text-cyan-300">/galeria.json</code> no final (ex:{' '}
                  <code className="font-mono text-slate-300">
                    https://meu-app.firebaseio.com/galeria.json
                  </code>
                  ).
                </li>
              </ol>
            </div>
          </div>

          {/* Section 3: Sync Now & Local JSON Backup Portability */}
          <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                3. Portabilidade Total & Backup Manual (.JSON)
              </h3>
              {lastSyncedAt && (
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  Última sinc: {new Date(lastSyncedAt).toLocaleTimeString('pt-BR')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={onSyncNow}
                disabled={syncStatus === 'syncing'}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    syncStatus === 'syncing' ? 'animate-spin' : ''
                  }`}
                />
                <span>Sincronizar Agora</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Backup (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Importar Backup (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRestoreDemoApps();
                  setFeedbackMsg('Apps de demonstração restaurados nos slots 0, 2, 11 e 18!');
                }}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurar Demo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
