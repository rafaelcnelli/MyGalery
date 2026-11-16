import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Globe,
  Layers,
  Palette,
  Image as ImageIcon,
  RefreshCw,
  ArrowUpRightSquare,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  WebAppItem,
  AppCategory,
  AccentColor,
  ACCENT_COLOR_MAP,
  TOTAL_SLOTS,
} from '../types/launcher';
import {
  normalizeUrl,
  formatSlotNumber,
  findFirstEmptySlot,
} from '../utils/launcherLogic';
import { AppLogo } from './AppLogo';

interface AppFormModalProps {
  isOpen: boolean;
  initialData: WebAppItem | null;
  targetSlot: number | null;
  existingApps: WebAppItem[];
  onClose: () => void;
  onSave: (
    data: Omit<WebAppItem, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
}

const CATEGORIES: AppCategory[] = [
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

const ACCENT_COLORS: { id: AccentColor; label: string }[] = [
  { id: 'indigo', label: 'Indigo' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'amber', label: 'Amber' },
  { id: 'rose', label: 'Rose' },
  { id: 'purple', label: 'Purple' },
  { id: 'blue', label: 'Blue' },
  { id: 'orange', label: 'Orange' },
];

export const AppFormModal: React.FC<AppFormModalProps> = ({
  isOpen,
  initialData,
  targetSlot,
  existingApps,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<AppCategory>('SaaS');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [useMonogramFallback, setUseMonogramFallback] = useState(false);
  const [openExternalOnly, setOpenExternalOnly] = useState(false);
  const [slotIndex, setSlotIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
      setCategory(initialData.category);
      setAccentColor(initialData.accentColor);
      const isMono = initialData.customLogoUrl === 'monogram://fallback';
      setUseMonogramFallback(isMono);
      setCustomLogoUrl(isMono ? '' : initialData.customLogoUrl || '');
      setOpenExternalOnly(Boolean(initialData.openExternalOnly));
      setSlotIndex(initialData.slotIndex);
    } else {
      setName('');
      setUrl('');
      setCategory('SaaS');
      setAccentColor('indigo');
      setCustomLogoUrl('');
      setUseMonogramFallback(false);
      setOpenExternalOnly(false);
      const defaultSlot =
        targetSlot !== null ? targetSlot : findFirstEmptySlot(existingApps);
      setSlotIndex(defaultSlot);
    }
  }, [isOpen, initialData, targetSlot, existingApps]);

  const slotMap = useMemo(() => {
    const map = new Map<number, WebAppItem>();
    for (const app of existingApps) {
      map.set(app.slotIndex, app);
    }
    return map;
  }, [existingApps]);

  if (!isOpen) return null;

  const occupantAtTarget = slotMap.get(slotIndex);
  const isOccupiedByOther =
    occupantAtTarget && occupantAtTarget.id !== initialData?.id;

  const destinationSlotForOccupant = initialData
    ? initialData.slotIndex
    : findFirstEmptySlot(
        existingApps.filter((a) => a.slotIndex !== slotIndex)
      );

  const previewUrl = url.trim() ? normalizeUrl(url) : 'https://example.com';
  const effectiveLogoUrl = useMonogramFallback
    ? 'monogram://fallback'
    : customLogoUrl.trim() || undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do aplicativo.');
      return;
    }
    if (!url.trim()) {
      setError('Informe a URL do aplicativo.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        url: normalizeUrl(url),
        category,
        accentColor,
        customLogoUrl: effectiveLogoUrl,
        openExternalOnly,
        slotIndex,
      },
      initialData?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm sm:text-base font-display font-bold text-white">
              {initialData
                ? `Editar Web App (#${formatSlotNumber(initialData.slotIndex)})`
                : 'Cadastrar Novo Web App'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* Top Live Preview Card + Core Fields */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-xl bg-zinc-900/70 border border-white/10">
            <div className="relative shrink-0">
              <AppLogo
                name={name || 'Web App'}
                url={previewUrl}
                accentColor={accentColor}
                customLogoUrl={effectiveLogoUrl}
                size="lg"
                forceMonogram={useMonogramFallback}
              />
              {openExternalOnly && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono text-[10px] font-bold shadow">
                  ↗
                </span>
              )}
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Nome do Aplicativo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Linear Workspace"
                  maxLength={36}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  URL de Destino *
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://linear.app"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category & Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Categoria (Define a Sala no Estúdio Pixel)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium border text-left transition-all ${
                      category === cat
                        ? 'bg-indigo-600/25 border-indigo-500 text-white'
                        : 'bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  Cor de Destaque (Neon / Glow)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ACCENT_COLORS.map((c) => {
                    const style = ACCENT_COLOR_MAP[c.id];
                    const selected = accentColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAccentColor(c.id)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-[11px] font-medium transition-all ${
                          selected
                            ? 'bg-white/15 border-white/40 text-white'
                            : 'bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full bg-gradient-to-br ${style.bgGradient} shrink-0`}
                        />
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Logo or Monogram Fallback */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Ícone Customizado (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseMonogramFallback((prev) => !prev)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                      useMonogramFallback
                        ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {useMonogramFallback ? 'Monograma 2 Letras: ON' : 'Forçar Monograma'}
                  </button>
                </div>
                {!useMonogramFallback && (
                  <input
                    type="text"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="Deixe vazio para extrair o Favicon automático"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Open External Only Toggle */}
              <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ArrowUpRightSquare className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      Sempre abrir em Nova Aba (↗)
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      Evita bloqueio de iframe (X-Frame-Options)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenExternalOnly((prev) => !prev)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold border transition-colors ${
                    openExternalOnly
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-white/10'
                  }`}
                >
                  {openExternalOnly ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Visual 40-Slot Grid Selector (#01 to #40) + Auto-Swap Notice */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Seletor Visual de Posição (Grade Fixa #01 a #40)
              </label>
              <span className="text-xs font-mono text-indigo-400">
                Selecionado: #{formatSlotNumber(slotIndex)}
              </span>
            </div>

            {isOccupiedByOther && occupantAtTarget && (
              <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/35 text-xs text-amber-200 flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  🔄 O slot #{formatSlotNumber(slotIndex)} está ocupado por{' '}
                  <strong>{occupantAtTarget.name}</strong>. Ao salvar,{' '}
                  <strong>{occupantAtTarget.name}</strong> será movido
                  automaticamente para o slot #
                  {formatSlotNumber(destinationSlotForOccupant)}.
                </span>
              </div>
            )}

            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-2.5 rounded-xl bg-zinc-900/70 border border-white/10">
              {Array.from({ length: TOTAL_SLOTS }, (_, idx) => {
                const occ = slotMap.get(idx);
                const isSelected = slotIndex === idx;
                const isSelf = occ && occ.id === initialData?.id;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSlotIndex(idx)}
                    title={
                      occ
                        ? `Slot #${formatSlotNumber(idx)} — ${occ.name}`
                        : `Slot #${formatSlotNumber(idx)} (Vazio)`
                    }
                    className={`relative h-10 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/40 text-white'
                        : occ
                          ? 'bg-zinc-950/90 border-white/15 text-zinc-300 hover:border-white/35'
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-[9px] font-mono leading-none mb-0.5">
                      #{formatSlotNumber(idx)}
                    </span>
                    {occ ? (
                      <span className="text-[9px] font-semibold truncate max-w-[90%] px-0.5 text-indigo-300">
                        {isSelf ? 'Atual' : occ.name.slice(0, 6)}
                      </span>
                    ) : (
                      <span className="text-[8px] text-zinc-600">Livre</span>
                    )}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              {initialData ? 'Salvar Alterações' : 'Adicionar ao Slot #' + formatSlotNumber(slotIndex)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
