import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Tag,
  Image as ImageIcon,
  Trash2,
  Check,
  Grid,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  ACCENT_COLOR_MAP,
  AccentColor,
  APP_CATEGORIES,
  TOTAL_GRID_SLOTS,
  WebAppItem,
} from '../types/launcher';
import {
  extractHostname,
  findFirstAvailableSlot,
  normalizeAppUrl,
  sanitizeWebAppItem,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface AppFormModalProps {
  isOpen: boolean;
  editingApp: WebAppItem | null;
  initialSlotIndex: number | null;
  existingApps: WebAppItem[];
  ownerId: string;
  onClose: () => void;
  onSave: (app: WebAppItem) => void;
  onDelete?: (appId: string) => void;
}

export const AppFormModal: React.FC<AppFormModalProps> = ({
  isOpen,
  editingApp,
  initialSlotIndex,
  existingApps,
  ownerId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('SaaS');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [slotIndex, setSlotIndex] = useState(0);
  const [preferMonogram, setPreferMonogram] = useState(false);
  const [activeLogoSource, setActiveLogoSource] = useState<
    'custom' | 'google' | 'duckduckgo' | 'monogram'
  >('monogram');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingApp) {
      setName(editingApp.name);
      setUrl(editingApp.url);
      setCategory(editingApp.category);
      setAccentColor(editingApp.accentColor);
      setCustomLogoUrl(
        editingApp.customLogoUrl === 'monogram://fallback'
          ? ''
          : editingApp.customLogoUrl
      );
      setPreferMonogram(editingApp.customLogoUrl === 'monogram://fallback');
      setSlotIndex(editingApp.slotIndex);
    } else {
      setName('');
      setUrl('');
      setCategory('SaaS');
      setAccentColor('indigo');
      setCustomLogoUrl('');
      setPreferMonogram(false);
      setSlotIndex(findFirstAvailableSlot(existingApps, initialSlotIndex));
    }
  }, [isOpen, editingApp, initialSlotIndex, existingApps]);

  if (!isOpen) return null;

  const detectedHostname = extractHostname(url);
  const normalizedPreviewUrl = normalizeAppUrl(url);

  // Check if selected slot is currently occupied by another app
  const slotOccupant = existingApps.find(
    (a) => a.slotIndex === slotIndex && a.id !== editingApp?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setErrorMsg('Informe o nome do Web App.');
      return;
    }
    if (!trimmedUrl) {
      setErrorMsg('Informe a URL ou domínio do Web App.');
      return;
    }

    const finalUrl = normalizeAppUrl(trimmedUrl);
    const finalCustomLogo = preferMonogram
      ? 'monogram://fallback'
      : customLogoUrl.trim()
        ? normalizeAppUrl(customLogoUrl.trim())
        : '';

    const item = sanitizeWebAppItem(
      {
        id: editingApp?.id || `app-${Date.now()}`,
        ownerId,
        name: trimmedName,
        url: finalUrl,
        category: category.trim() || 'SaaS',
        accentColor,
        customLogoUrl: finalCustomLogo,
        slotIndex,
        createdAt: editingApp?.createdAt,
      },
      ownerId
    );

    onSave(item);
    onClose();
  };

  const sourceLabelMap = {
    custom: 'Logo Customizada (Override)',
    google: 'Google S2 Favicon HD (128px)',
    duckduckgo: 'DuckDuckGo Icons Fallback',
    monogram: 'Monograma Estilizado com Iniciais',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2
              id="app-form-modal-title"
              className="font-display font-bold text-lg text-white"
            >
              {editingApp ? 'Editar Web App' : 'Novo Web App'}
            </h2>
            <p className="text-xs text-slate-400">
              Posicione no grid livre e extraia o ícone automaticamente pelo domínio
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1"
        >
          {/* Real-Time Logo Extraction Preview Bar */}
          <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="group">
                <AppLogo
                  name={name || 'Web App'}
                  url={url}
                  accentColor={accentColor}
                  customLogoUrl={preferMonogram ? '' : customLogoUrl}
                  forceMonogram={preferMonogram}
                  size="lg"
                  onSourceResolved={setActiveLogoSource}
                />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {name.trim() || 'Nome do Seu App'}
                </div>
                <div className="text-xs text-slate-400 font-mono truncate mt-0.5">
                  {detectedHostname || 'digite-a-url.com'}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 mt-1.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {sourceLabelMap[activeLogoSource]}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreferMonogram((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
                preferMonogram
                  ? 'bg-indigo-500/25 border-indigo-400/50 text-indigo-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {preferMonogram ? 'Usando Iniciais' : 'Usar Iniciais'}
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-2.5 flex items-center gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Field 1 & 2: Name and URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="app-name-input"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Nome do App *
              </label>
              <input
                id="app-name-input"
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Raycast Docs, Meu SaaS..."
                className="w-full bg-slate-950/90 text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="app-url-input"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                URL / Link do App *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="app-url-input"
                  type="text"
                  required
                  maxLength={500}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={() => {
                    if (url.trim()) setUrl(normalizeAppUrl(url));
                  }}
                  placeholder="meusite.com ou https://..."
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:outline-none"
                />
              </div>
              {url.trim() && !/^https?:\/\//i.test(url.trim()) && (
                <p className="text-[11px] text-emerald-400 mt-1 font-mono truncate">
                  Auto-correção: {normalizedPreviewUrl}
                </p>
              )}
            </div>
          </div>

          {/* Field 3 & 6: Category Tag & Grid Slot Coordinate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="app-category-select"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Categoria / Tag</span>
                </span>
              </label>
              <select
                id="app-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/90 text-white text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:outline-none cursor-pointer"
              >
                {APP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="app-slot-select"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Coordenada no Grid (Slot 0–39)</span>
                </span>
              </label>
              <select
                id="app-slot-select"
                value={slotIndex}
                onChange={(e) => setSlotIndex(Number(e.target.value))}
                className="w-full bg-slate-950/90 text-white text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:outline-none font-mono cursor-pointer"
              >
                {Array.from({ length: TOTAL_GRID_SLOTS }, (_, idx) => {
                  const occ = existingApps.find(
                    (a) => a.slotIndex === idx && a.id !== editingApp?.id
                  );
                  const row = Math.floor(idx / 8) + 1;
                  const col = (idx % 8) + 1;
                  return (
                    <option key={idx} value={idx}>
                      Slot #{String(idx).padStart(2, '0')} (L{row}:C{col}){' '}
                      {occ ? `— Ocupado por ${occ.name} (Auto-Swap)` : '— Livre'}
                    </option>
                  );
                })}
              </select>
              {slotOccupant && (
                <p className="text-[11px] text-amber-300 mt-1">
                  Auto-Swap ativo: trocará de lugar com &ldquo;{slotOccupant.name}&rdquo;.
                </p>
              )}
            </div>
          </div>

          {/* Field 4: Accent Color Picker */}
          <div>
            <span className="block text-xs font-medium text-slate-300 mb-2">
              Cor de Destaque (Glow & Fallback de Iniciais)
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {(Object.keys(ACCENT_COLOR_MAP) as AccentColor[]).map((colorKey) => {
                const item = ACCENT_COLOR_MAP[colorKey];
                const isSelected = accentColor === colorKey;
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setAccentColor(colorKey)}
                    aria-label={`Cor ${item.label}`}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/40 scale-105'
                        : 'bg-slate-950/60 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.bgGradient} flex items-center justify-center shadow-md`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    <span className="text-[10px] text-slate-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 5: Optional Custom Logo URL */}
          <div>
            <label
              htmlFor="app-custom-logo-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-violet-300" />
                <span>URL Customizada da Logo (Opcional)</span>
              </span>
            </label>
            <input
              id="app-custom-logo-input"
              type="text"
              maxLength={500}
              disabled={preferMonogram}
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              placeholder="Deixe em branco para usar a extração automática pelo domínio"
              className="w-full bg-slate-950/90 text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-indigo-400/60 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            {editingApp && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingApp.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir App</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-medium border border-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 border border-white/15 transition-all cursor-pointer"
              >
                {editingApp ? 'Salvar Alterações' : 'Adicionar ao Grid'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
