export const TOTAL_GRID_SLOTS = 40; // 8 columns x 5 rows

export type WallpaperTheme = 'aurora' | 'midnight' | 'cyber' | 'ocean';

export type ClickBehavior = 'preview' | 'new_tab';

export type LauncherViewMode = 'grid' | 'sphere';

export type GridColumnsPerRow = 2 | 3 | 4 | 6 | 8;

export type GridScale = 'xs' | 'compact' | 'normal';

export type AccentColor =
  | 'indigo'
  | 'violet'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'fuchsia';

export type SyncStatus = 'online' | 'local' | 'syncing' | 'error';

export type AppCategory =
  | 'SaaS'
  | 'Utilitário'
  | 'IA'
  | 'Game'
  | 'Cliente'
  | 'Finanças'
  | 'Design'
  | 'DevTools';

export interface WebAppItem {
  id: string;
  ownerId: string;
  name: string;
  url: string;
  category: string;
  accentColor: AccentColor;
  customLogoUrl: string;
  slotIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface LauncherState {
  hubTitle: string;
  theme: WallpaperTheme;
  clickBehavior: ClickBehavior;
  viewMode?: LauncherViewMode;
  gridColumns?: GridColumnsPerRow;
  gridScale?: GridScale;
  cloudRestUrl: string;
  apps: WebAppItem[];
  lastSyncedAt?: string | null;
}

export const APP_CATEGORIES: AppCategory[] = [
  'SaaS',
  'Utilitário',
  'IA',
  'Game',
  'Cliente',
  'Finanças',
  'Design',
  'DevTools',
];

export const ACCENT_COLOR_MAP: Record<
  AccentColor,
  {
    label: string;
    bgGradient: string;
    iconGlow: string;
    borderHover: string;
    dotClass: string;
    textClass: string;
  }
> = {
  indigo: {
    label: 'Indigo',
    bgGradient: 'from-indigo-500 to-indigo-700',
    iconGlow: 'shadow-indigo-500/25 group-hover:shadow-indigo-500/45',
    borderHover: 'group-hover:border-indigo-400/40',
    dotClass: 'bg-indigo-500',
    textClass: 'text-indigo-300',
  },
  violet: {
    label: 'Violet',
    bgGradient: 'from-violet-500 to-purple-700',
    iconGlow: 'shadow-violet-500/25 group-hover:shadow-violet-500/45',
    borderHover: 'group-hover:border-violet-400/40',
    dotClass: 'bg-violet-500',
    textClass: 'text-violet-300',
  },
  cyan: {
    label: 'Cyan',
    bgGradient: 'from-cyan-500 to-sky-700',
    iconGlow: 'shadow-cyan-500/25 group-hover:shadow-cyan-500/45',
    borderHover: 'group-hover:border-cyan-400/40',
    dotClass: 'bg-cyan-500',
    textClass: 'text-cyan-300',
  },
  emerald: {
    label: 'Emerald',
    bgGradient: 'from-emerald-500 to-teal-700',
    iconGlow: 'shadow-emerald-500/25 group-hover:shadow-emerald-500/45',
    borderHover: 'group-hover:border-emerald-400/40',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-300',
  },
  amber: {
    label: 'Amber',
    bgGradient: 'from-amber-500 to-orange-700',
    iconGlow: 'shadow-amber-500/25 group-hover:shadow-amber-500/45',
    borderHover: 'group-hover:border-amber-400/40',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-300',
  },
  rose: {
    label: 'Rose',
    bgGradient: 'from-rose-500 to-pink-700',
    iconGlow: 'shadow-rose-500/25 group-hover:shadow-rose-500/45',
    borderHover: 'group-hover:border-rose-400/40',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-300',
  },
  blue: {
    label: 'Blue',
    bgGradient: 'from-blue-500 to-blue-700',
    iconGlow: 'shadow-blue-500/25 group-hover:shadow-blue-500/45',
    borderHover: 'group-hover:border-blue-400/40',
    dotClass: 'bg-blue-500',
    textClass: 'text-blue-300',
  },
  fuchsia: {
    label: 'Fuchsia',
    bgGradient: 'from-fuchsia-500 to-pink-700',
    iconGlow: 'shadow-fuchsia-500/25 group-hover:shadow-fuchsia-500/45',
    borderHover: 'group-hover:border-fuchsia-400/40',
    dotClass: 'bg-fuchsia-500',
    textClass: 'text-fuchsia-300',
  },
};

export const WALLPAPER_THEMES: Record<
  WallpaperTheme,
  {
    name: string;
    description: string;
    baseBg: string;
  }
> = {
  aurora: {
    name: 'Aurora Dark',
    description: 'Brilhos difusos em Indigo, Violeta e Ciano sobre Slate 950',
    baseBg: 'bg-slate-950',
  },
  midnight: {
    name: 'Midnight Minimal',
    description: 'Preto profundo monocromático estilo macOS Pro Display',
    baseBg: 'bg-neutral-950',
  },
  cyber: {
    name: 'Cyber Grid',
    description: 'Matriz técnica de coordenadas com luzes neon sutis',
    baseBg: 'bg-slate-950 bg-cyber-grid',
  },
  ocean: {
    name: 'Deep Ocean',
    description: 'Profundezas abissais em tons de Azul Petróleo e Esmeralda',
    baseBg: 'bg-slate-950',
  },
};

export const INITIAL_DEMO_APPS: WebAppItem[] = [
  {
    id: 'demo-app-linear',
    ownerId: 'local',
    name: 'Linear',
    url: 'https://linear.app',
    category: 'SaaS',
    accentColor: 'indigo',
    customLogoUrl: '',
    slotIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-excalidraw',
    ownerId: 'local',
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    category: 'Design',
    accentColor: 'violet',
    customLogoUrl: '',
    slotIndex: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-wikipedia',
    ownerId: 'local',
    name: 'Wikipedia',
    url: 'https://pt.wikipedia.org',
    category: 'Utilitário',
    accentColor: 'cyan',
    customLogoUrl: '',
    slotIndex: 11,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-vercel',
    ownerId: 'local',
    name: 'Vercel Cloud',
    url: 'https://vercel.com',
    category: 'DevTools',
    accentColor: 'emerald',
    customLogoUrl: '',
    slotIndex: 18,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
