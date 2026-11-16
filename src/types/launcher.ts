export const TOTAL_GRID_SLOTS = 40; // 8 columns x 5 rows
export const TOTAL_SLOTS = TOTAL_GRID_SLOTS;

export type WallpaperTheme = 'aurora' | 'midnight' | 'cyber' | 'ocean';

export type ClickBehavior = 'preview' | 'new_tab';

export type LauncherViewMode = 'grid' | 'sphere' | 'pixel-studio' | 'retro-os';
export type ViewMode = LauncherViewMode;

export type GridColumnsPerRow = 2 | 3 | 4 | 6 | 8;

export type GridScale = 'xs' | 'compact' | 'normal';
export type GridDensity = 'compact' | 'normal' | 'expanded';

export type AccentColor =
  | 'indigo'
  | 'violet'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'fuchsia'
  | 'purple'
  | 'orange';

export type SyncStatus = 'online' | 'local' | 'syncing' | 'error';

export type AppCategory =
  | 'SaaS'
  | 'Produtividade'
  | 'Utilitário'
  | 'IA'
  | 'Game'
  | 'Social'
  | 'Cliente'
  | 'Finanças'
  | 'Design'
  | 'DevTools';

export const CATEGORY_COLORS: Record<string, string> = {
  SaaS: '#6366f1',
  Produtividade: '#3b82f6',
  Utilitário: '#06b6d4',
  IA: '#10b981',
  Game: '#ec4899',
  Social: '#8b5cf6',
  Cliente: '#f59e0b',
  Finanças: '#eab308',
  Design: '#d946ef',
  DevTools: '#14b8a6',
};

export interface WebAppItem {
  id: string;
  ownerId?: string;
  name: string;
  url: string;
  category: AppCategory;
  accentColor: AccentColor;
  customLogoUrl?: string;
  slotIndex: number;
  openExternalOnly?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LauncherState {
  hubTitle: string;
  theme: WallpaperTheme;
  wallpaperTheme: WallpaperTheme;
  clickBehavior: ClickBehavior;
  directLaunchMode?: boolean;
  viewMode: LauncherViewMode;
  gridColumns?: GridColumnsPerRow;
  gridScale?: GridScale;
  gridDensity: GridDensity;
  cloudRestUrl: string;
  apps: WebAppItem[];
  lastSyncedAt?: string | null;
}

export const APP_CATEGORIES: AppCategory[] = [
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
  purple: {
    label: 'Purple',
    bgGradient: 'from-purple-500 to-indigo-700',
    iconGlow: 'shadow-purple-500/25 group-hover:shadow-purple-500/45',
    borderHover: 'group-hover:border-purple-400/40',
    dotClass: 'bg-purple-500',
    textClass: 'text-purple-300',
  },
  orange: {
    label: 'Orange',
    bgGradient: 'from-orange-500 to-amber-700',
    iconGlow: 'shadow-orange-500/25 group-hover:shadow-orange-500/45',
    borderHover: 'group-hover:border-orange-400/40',
    dotClass: 'bg-orange-500',
    textClass: 'text-orange-300',
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
    openExternalOnly: false,
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
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-claude',
    ownerId: 'local',
    name: 'Claude AI',
    url: 'https://claude.ai',
    category: 'IA',
    accentColor: 'amber',
    customLogoUrl: '',
    slotIndex: 3,
    openExternalOnly: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-stripe',
    ownerId: 'local',
    name: 'Stripe FinOps',
    url: 'https://dashboard.stripe.com',
    category: 'Finanças',
    accentColor: 'violet',
    customLogoUrl: '',
    slotIndex: 4,
    openExternalOnly: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-notion',
    ownerId: 'local',
    name: 'Notion Workspace',
    url: 'https://notion.so',
    category: 'Produtividade',
    accentColor: 'blue',
    customLogoUrl: '',
    slotIndex: 5,
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-figma',
    ownerId: 'local',
    name: 'Figma Studio',
    url: 'https://figma.com',
    category: 'Design',
    accentColor: 'rose',
    customLogoUrl: '',
    slotIndex: 6,
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-apex-racing',
    ownerId: 'local',
    name: 'Apex Racing Sim',
    url: 'https://apex-racing.example.com',
    category: 'Game',
    accentColor: 'cyan',
    customLogoUrl: 'monogram://fallback',
    slotIndex: 7,
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-github',
    ownerId: 'local',
    name: 'GitHub Repos',
    url: 'https://github.com',
    category: 'DevTools',
    accentColor: 'indigo',
    customLogoUrl: '',
    slotIndex: 8,
    openExternalOnly: true,
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
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-bluesky',
    ownerId: 'local',
    name: 'Bluesky Social',
    url: 'https://bsky.app',
    category: 'Social',
    accentColor: 'blue',
    customLogoUrl: '',
    slotIndex: 12,
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-hubspot',
    ownerId: 'local',
    name: 'HubSpot CRM',
    url: 'https://www.hubspot.com',
    category: 'Cliente',
    accentColor: 'amber',
    customLogoUrl: '',
    slotIndex: 14,
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-celeste',
    ownerId: 'local',
    name: 'Celeste 8-Bit',
    url: 'https://itch.io',
    category: 'Game',
    accentColor: 'fuchsia',
    customLogoUrl: '',
    slotIndex: 15,
    openExternalOnly: false,
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
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-app-suno',
    ownerId: 'local',
    name: 'Suno AI Audio',
    url: 'https://suno.com',
    category: 'IA',
    accentColor: 'emerald',
    customLogoUrl: '',
    slotIndex: 19,
    openExternalOnly: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
