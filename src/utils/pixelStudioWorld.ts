import { WebAppItem } from '../types/launcher';

export const STUDIO_TILE_SIZE = 40;
export const STUDIO_MAP_COLS = 34;
export const STUDIO_MAP_ROWS = 22;
export const STUDIO_WORLD_WIDTH = STUDIO_MAP_COLS * STUDIO_TILE_SIZE; // 1360px
export const STUDIO_WORLD_HEIGHT = STUDIO_MAP_ROWS * STUDIO_TILE_SIZE; // 880px

export type StudioRoomId =
  | 'central-lobby'
  | 'devtools-ai'
  | 'design-social'
  | 'finance-prod'
  | 'arcade-games';

export type CharacterDirection = 'down' | 'up' | 'left' | 'right';

export interface TileCoord {
  col: number;
  row: number;
}

export type StudioDecorKind =
  | 'server-rack'
  | 'whiteboard-flow'
  | 'terminal-wall'
  | 'vending-drink'
  | 'boxes-stack'
  | 'framed-art'
  | 'photo-studio'
  | 'art-easel'
  | 'rgb-lamp'
  | 'palette-table'
  | 'modern-puff'
  | 'wood-bookshelf'
  | 'printer-3d'
  | 'chart-board'
  | 'calculator-desk'
  | 'water-cooler'
  | 'cardboard-boxes'
  | 'highscore-sign'
  | 'claw-machine'
  | 'pinball-machine'
  | 'arcade-cabinet'
  | 'cockpit-sim'
  | 'coffee-bar'
  | 'cafe-table'
  | 'vending-machine'
  | 'sofa'
  | 'plant'
  | 'paired-wood-desks'
  | 'trash-bin'
  | 'swivel-chair'
  | 'filing-cabinet'
  | 'server-desk';

export interface StudioDecorProp {
  id: string;
  kind: StudioDecorKind;
  col: number;
  row: number;
  widthTiles?: number;
  label?: string;
  walkable?: boolean;
  chairColor?: 'red' | 'green' | 'blue' | 'amber' | 'purple';
}

export interface StudioNPCDef {
  id: string;
  name: string;
  role: string;
  col: number;
  row: number;
  shirtColor: string;
  hairColor: string;
}

export interface RoamingStudioNPCDef {
  id: string;
  name: string;
  role: string;
  shirtColor: string;
  hairColor: string;
  pantsColor: string;
  accessory: 'glasses' | 'headset' | 'coffee' | 'cap';
  spawnTile: TileCoord;
  homeRoomId: StudioRoomId;
  statusPhrases: string[];
}

export interface RoamingStudioNPCState {
  id: string;
  name: string;
  role: string;
  shirtColor: string;
  hairColor: string;
  pantsColor: string;
  accessory: 'glasses' | 'headset' | 'coffee' | 'cap';
  x: number;
  y: number;
  direction: CharacterDirection;
  isMoving: boolean;
  walkFrame: 0 | 1;
  stepDist: number;
  pathQueue: TileCoord[];
  pauseTimer: number;
  statusText: string;
  targetRoomId: StudioRoomId;
}

export const MAX_ROOM_STATIONS = 8;

export interface StudioRoomDef {
  id: StudioRoomId;
  title: string;
  shortTitle: string;
  subtitle: string;
  categoryFilter: string;
  categories: string[];
  accentHex: string;
  wallColorHex: string;
  wallTrimHex: string;
  floorClass: string;
  borderHex: string;
  bounds: { minCol: number; maxCol: number; minRow: number; maxRow: number };
  centerTile: TileCoord;
  teleportTile: TileCoord;
  crtTile: TileCoord;
  crtInteractTile: TileCoord;
  crtWidthTiles: number;
  deskSlots: TileCoord[];
  decorProps: StudioDecorProp[];
  npc: StudioNPCDef;
}

export type AppFurnitureStyle =
  | 'cyber'
  | 'design'
  | 'executive'
  | 'arcade'
  | 'arcade-racing'
  | 'cluster-rack'
  | 'lobby';

export interface PlacedAppTerminal {
  app: WebAppItem;
  roomId: StudioRoomId;
  col: number;
  row: number;
  interactTile: TileCoord;
  styleVariant: AppFurnitureStyle;
  isClusterRack?: boolean;
  clusterApps?: WebAppItem[];
}

export const PLAYER_SPAWN_POS = {
  x: 16.5 * STUDIO_TILE_SIZE,
  y: 12.2 * STUDIO_TILE_SIZE,
};

/**
 * Detects whether a Game app is a racing, sports, or cockpit simulator title
 * (e.g. "Racing", "Apex", "Futebol", "Estrelato", "F1", "Kart", "Drift", "Sim").
 */
export function isRacingOrSportsApp(app: WebAppItem): boolean {
  const haystack = `${app.name} ${app.url}`.toLowerCase();
  const keywords = [
    'racing',
    'race',
    'apex',
    'futebol',
    'estrelato',
    'f1',
    'kart',
    'drift',
    'rally',
    'forza',
    'turismo',
    'cockpit',
    'simulador',
    'soccer',
    'fifa',
    'nba',
    'speed',
    'car',
    'moto',
    'pilot',
  ];
  return keywords.some((kw) => haystack.includes(kw));
}

export const STUDIO_ROOMS: StudioRoomDef[] = [
  {
    id: 'central-lobby',
    title: 'Salão Central & Monitor CRT',
    shortTitle: 'Salão Central',
    subtitle: 'Cafeteria Pixel · Hub Retro OS · Recepção',
    categoryFilter: 'ALL',
    categories: [],
    accentHex: '#fbbf24',
    wallColorHex: '#d9a773',
    wallTrimHex: '#7c5335',
    floorClass: 'studio-floor-lobby',
    borderHex: 'rgba(251, 191, 36, 0.45)',
    bounds: { minCol: 13, maxCol: 20, minRow: 1, maxRow: 20 },
    centerTile: { col: 16, row: 12 },
    teleportTile: { col: 16, row: 12 },
    crtTile: { col: 16, row: 9 },
    crtInteractTile: { col: 16, row: 10 },
    crtWidthTiles: 2,
    deskSlots: [
      { col: 14, row: 7 },
      { col: 19, row: 7 },
      { col: 14, row: 14 },
      { col: 19, row: 14 },
    ],
    decorProps: [
      {
        id: 'coffee',
        kind: 'coffee-bar',
        col: 14,
        row: 1,
        widthTiles: 6,
        label: 'Cafeteria Pixel Expresso',
      },
      { id: 'plant-nw', kind: 'plant', col: 13, row: 1, label: 'Planta' },
      { id: 'plant-ne', kind: 'plant', col: 20, row: 1, label: 'Planta' },
      {
        id: 'cafe-table-left',
        kind: 'cafe-table',
        col: 14,
        row: 3,
        widthTiles: 2,
        label: 'Mesa de Café',
        walkable: true,
      },
      {
        id: 'cafe-table-right',
        kind: 'cafe-table',
        col: 19,
        row: 3,
        widthTiles: 2,
        label: 'Mesa de Café',
        walkable: true,
      },
      {
        id: 'vending-left',
        kind: 'vending-machine',
        col: 13,
        row: 17,
        widthTiles: 1,
        label: 'Vending Machine',
      },
      {
        id: 'vending-right',
        kind: 'vending-machine',
        col: 20,
        row: 17,
        widthTiles: 1,
        label: 'Vending Machine',
      },
      {
        id: 'trash-lobby',
        kind: 'trash-bin',
        col: 13,
        row: 19,
        widthTiles: 1,
        label: 'Lixeira do Lobby',
        walkable: true,
      },
      {
        id: 'sofa',
        kind: 'sofa',
        col: 15,
        row: 19,
        widthTiles: 4,
        label: 'Sofá da Recepção',
      },
      { id: 'plant-sw', kind: 'plant', col: 13, row: 20, label: 'Planta' },
      { id: 'plant-se', kind: 'plant', col: 20, row: 20, label: 'Planta' },
    ],
    npc: {
      id: 'npc-chief',
      name: 'ARCH-00',
      role: 'Anfitrião do Hub',
      col: 17,
      row: 3,
      shirtColor: '#6366f1',
      hairColor: '#f8fafc',
    },
  },
  {
    id: 'devtools-ai',
    title: 'Lab DevTools & IA',
    shortTitle: 'Dev & IA',
    subtitle: 'Racks de Servidores · Fluxogramas · Estações Hacker',
    categoryFilter: 'DevTools,IA,Utilitário',
    categories: ['devtools', 'ia', 'utilitário'],
    accentHex: '#10b981',
    wallColorHex: '#334155',
    wallTrimHex: '#0f172a',
    floorClass: 'studio-floor-devtools',
    borderHex: 'rgba(16, 185, 129, 0.5)',
    bounds: { minCol: 1, maxCol: 11, minRow: 1, maxRow: 8 },
    centerTile: { col: 6, row: 4 },
    teleportTile: { col: 11, row: 5 },
    crtTile: { col: 10, row: 1 },
    crtInteractTile: { col: 10, row: 2 },
    crtWidthTiles: 1,
    deskSlots: [
      { col: 2, row: 3 },
      { col: 4, row: 3 },
      { col: 6, row: 3 },
      { col: 8, row: 3 },
      { col: 10, row: 3 },
      { col: 2, row: 5 },
      { col: 4, row: 5 },
      { col: 8, row: 5 },
      { col: 2, row: 7 },
      { col: 4, row: 7 },
      { col: 8, row: 7 },
      { col: 10, row: 7 },
    ],
    decorProps: [
      {
        id: 'srv-bank',
        kind: 'server-rack',
        col: 1,
        row: 1,
        widthTiles: 3,
        label: 'Racks de Servidores GPU & Nodes',
      },
      {
        id: 'whiteboard-1',
        kind: 'whiteboard-flow',
        col: 5,
        row: 1,
        widthTiles: 3,
        label: 'Quadro Branco de Arquitetura & Fluxogramas',
      },
      {
        id: 'term-1',
        kind: 'terminal-wall',
        col: 8,
        row: 1,
        widthTiles: 2,
        label: 'Monitor de Cluster LLM',
      },
      {
        id: 'vending-dev',
        kind: 'vending-drink',
        col: 11,
        row: 1,
        widthTiles: 1,
        label: 'Máquina de Bebidas Energéticas',
      },
      {
        id: 'dev-collab-desk',
        kind: 'server-desk',
        col: 5,
        row: 6,
        widthTiles: 2,
        label: 'Bancada de Debug & DevOps',
        walkable: true,
      },
      {
        id: 'chair-dev-green',
        kind: 'swivel-chair',
        col: 10,
        row: 6,
        widthTiles: 1,
        label: 'Cadeira Giratória Dev',
        chairColor: 'green',
        walkable: true,
      },
      {
        id: 'trash-dev',
        kind: 'trash-bin',
        col: 1,
        row: 7,
        widthTiles: 1,
        label: 'Cesto de Papel',
        walkable: true,
      },
      { id: 'plant-dev', kind: 'plant', col: 1, row: 8, label: 'Planta' },
      {
        id: 'boxes-dev',
        kind: 'boxes-stack',
        col: 11,
        row: 8,
        widthTiles: 1,
        label: 'Caixas de Hardware',
      },
    ],
    npc: {
      id: 'npc-dev',
      name: 'DEV-01',
      role: 'Compilando IA',
      col: 4,
      row: 1,
      shirtColor: '#10b981',
      hairColor: '#fbbf24',
    },
  },
  {
    id: 'design-social',
    title: 'Estúdio Design & Social',
    shortTitle: 'Design & Social',
    subtitle: 'Cintiq Displays · Estúdio Fotográfico · Galeria Neon',
    categoryFilter: 'Design,Social',
    categories: ['design', 'social'],
    accentHex: '#d946ef',
    wallColorHex: '#c084fc',
    wallTrimHex: '#4c1d95',
    floorClass: 'studio-floor-design',
    borderHex: 'rgba(217, 70, 239, 0.5)',
    bounds: { minCol: 22, maxCol: 32, minRow: 1, maxRow: 8 },
    centerTile: { col: 27, row: 4 },
    teleportTile: { col: 22, row: 5 },
    crtTile: { col: 31, row: 1 },
    crtInteractTile: { col: 31, row: 2 },
    crtWidthTiles: 1,
    deskSlots: [
      { col: 23, row: 3 },
      { col: 25, row: 3 },
      { col: 27, row: 3 },
      { col: 29, row: 3 },
      { col: 31, row: 3 },
      { col: 25, row: 5 },
      { col: 29, row: 5 },
      { col: 31, row: 5 },
      { col: 23, row: 7 },
      { col: 25, row: 7 },
      { col: 29, row: 7 },
      { col: 31, row: 7 },
    ],
    decorProps: [
      {
        id: 'gallery-wall',
        kind: 'framed-art',
        col: 22,
        row: 1,
        widthTiles: 3,
        label: 'Quadros Pixel Art & Letreiro Neon',
      },
      {
        id: 'palette-1',
        kind: 'palette-table',
        col: 26,
        row: 1,
        widthTiles: 2,
        label: 'Bancada de Paletas & Pantone',
      },
      {
        id: 'photo-set',
        kind: 'photo-studio',
        col: 28,
        row: 1,
        widthTiles: 3,
        label: 'Mini Estúdio Fotográfico (Fundo Infinito + Softbox)',
      },
      {
        id: 'rgb-1',
        kind: 'rgb-lamp',
        col: 32,
        row: 1,
        widthTiles: 1,
        label: 'Torre de Iluminação RGB',
      },
      {
        id: 'easel-des',
        kind: 'art-easel',
        col: 22,
        row: 3,
        widthTiles: 1,
        label: 'Cavalete de Pintura Pixel',
        walkable: true,
      },
      {
        id: 'chair-des-blue',
        kind: 'swivel-chair',
        col: 32,
        row: 6,
        widthTiles: 1,
        label: 'Cadeira Giratória Design',
        chairColor: 'blue',
        walkable: true,
      },
      {
        id: 'puff-des',
        kind: 'modern-puff',
        col: 22,
        row: 8,
        widthTiles: 1,
        label: 'Puff Lounge Criativo',
      },
      { id: 'plant-des', kind: 'plant', col: 32, row: 8, label: 'Planta' },
    ],
    npc: {
      id: 'npc-art',
      name: 'ART-02',
      role: 'Criando Sprites',
      col: 25,
      row: 1,
      shirtColor: '#d946ef',
      hairColor: '#38bdf8',
    },
  },
  {
    id: 'finance-prod',
    title: 'Escritório Finanças & Ops',
    shortTitle: 'Finanças & Ops',
    subtitle: 'Estantes Executivas · Impressora 3D · Métricas',
    categoryFilter: 'Finanças,Produtividade,SaaS,Cliente',
    categories: ['finanças', 'produtividade', 'saas', 'cliente'],
    accentHex: '#f59e0b',
    wallColorHex: '#e2b18c',
    wallTrimHex: '#6b4435',
    floorClass: 'studio-floor-finance',
    borderHex: 'rgba(245, 158, 11, 0.5)',
    bounds: { minCol: 1, maxCol: 11, minRow: 13, maxRow: 20 },
    centerTile: { col: 6, row: 17 },
    teleportTile: { col: 11, row: 15 },
    crtTile: { col: 10, row: 13 },
    crtInteractTile: { col: 10, row: 14 },
    crtWidthTiles: 1,
    deskSlots: [
      { col: 2, row: 15 },
      { col: 4, row: 15 },
      { col: 6, row: 15 },
      { col: 8, row: 15 },
      { col: 2, row: 17 },
      { col: 4, row: 17 },
      { col: 8, row: 17 },
      { col: 10, row: 17 },
      { col: 2, row: 19 },
      { col: 4, row: 19 },
      { col: 8, row: 19 },
      { col: 10, row: 19 },
    ],
    decorProps: [
      {
        id: 'chart-1',
        kind: 'chart-board',
        col: 1,
        row: 13,
        widthTiles: 4,
        label: 'Janela Panorâmica Tripla & Quadro de Métricas (Estilo Referência)',
      },
      {
        id: 'bookshelf-exec',
        kind: 'wood-bookshelf',
        col: 5,
        row: 13,
        widthTiles: 3,
        label: 'Estante Executiva de Madeira com Gavetas, Livros Coloridos & Relatórios',
      },
      {
        id: 'print-3d',
        kind: 'printer-3d',
        col: 8,
        row: 13,
        widthTiles: 2,
        label: 'Bancada com Impressora 3D Animada',
      },
      {
        id: 'water-cooler-1',
        kind: 'water-cooler',
        col: 11,
        row: 13,
        widthTiles: 1,
        label: 'Bebedouro do Escritório',
      },
      {
        id: 'boxes-fin-top',
        kind: 'cardboard-boxes',
        col: 1,
        row: 14,
        widthTiles: 1,
        label: 'Pilha de Caixas de Papelão (Estilo Referência)',
        walkable: true,
      },
      {
        id: 'paired-desks-fin',
        kind: 'paired-wood-desks',
        col: 5,
        row: 17,
        widthTiles: 3,
        label: 'Mesas Duplas de Escritório com Monitor, Laptop e Cadeiras Vermelha/Verde',
        walkable: true,
      },
      {
        id: 'chair-fin-blue',
        kind: 'swivel-chair',
        col: 11,
        row: 19,
        widthTiles: 1,
        label: 'Cadeira Giratória Azul com Rodízios',
        chairColor: 'blue',
        walkable: true,
      },
      {
        id: 'trash-fin',
        kind: 'trash-bin',
        col: 1,
        row: 20,
        widthTiles: 1,
        label: 'Cesto de Lixo Cilíndrico Cinza',
      },
      { id: 'plant-fin', kind: 'plant', col: 11, row: 20, label: 'Planta' },
    ],
    npc: {
      id: 'npc-ops',
      name: 'OPS-03',
      role: 'Análise & 3D',
      col: 9,
      row: 14,
      shirtColor: '#f59e0b',
      hairColor: '#a855f7',
    },
  },
  {
    id: 'arcade-games',
    title: 'Salão Arcade & Games',
    shortTitle: 'Arcade & Games',
    subtitle: 'Fliperamas 16-Bit · High Scores · Claw Machine',
    categoryFilter: 'Game',
    categories: ['game'],
    accentHex: '#06b6d4',
    wallColorHex: '#1e293b',
    wallTrimHex: '#090d16',
    floorClass: 'studio-floor-arcade',
    borderHex: 'rgba(6, 182, 212, 0.5)',
    bounds: { minCol: 22, maxCol: 32, minRow: 13, maxRow: 20 },
    centerTile: { col: 27, row: 17 },
    teleportTile: { col: 22, row: 15 },
    crtTile: { col: 31, row: 13 },
    crtInteractTile: { col: 31, row: 14 },
    crtWidthTiles: 1,
    deskSlots: [
      { col: 25, row: 15 },
      { col: 27, row: 15 },
      { col: 29, row: 15 },
      { col: 31, row: 15 },
      { col: 23, row: 17 },
      { col: 25, row: 17 },
      { col: 29, row: 17 },
      { col: 31, row: 17 },
      { col: 23, row: 19 },
      { col: 25, row: 19 },
      { col: 29, row: 19 },
      { col: 31, row: 19 },
    ],
    decorProps: [
      {
        id: 'cockpit-1',
        kind: 'cockpit-sim',
        col: 22,
        row: 13,
        widthTiles: 2,
        label: 'Simulador Cockpit Arcade',
      },
      {
        id: 'highscore-wall',
        kind: 'highscore-sign',
        col: 24,
        row: 13,
        widthTiles: 4,
        label: 'Letreiro HIGH SCORES & Pôsteres 16-Bit',
      },
      {
        id: 'claw-1',
        kind: 'claw-machine',
        col: 29,
        row: 13,
        widthTiles: 2,
        label: 'Claw Machine (Máquina de Pelúcia)',
      },
      {
        id: 'pinball-1',
        kind: 'pinball-machine',
        col: 32,
        row: 13,
        widthTiles: 1,
        label: 'Pinball Space 16-Bit',
      },
      {
        id: 'arc-extra-1',
        kind: 'arcade-cabinet',
        col: 22,
        row: 17,
        widthTiles: 1,
        label: 'Fliperama Retro Fighter',
        walkable: true,
      },
      {
        id: 'arc-corner',
        kind: 'arcade-cabinet',
        col: 22,
        row: 20,
        widthTiles: 1,
        label: 'Fliperama Clássico 1UP',
      },
      { id: 'plant-arc', kind: 'plant', col: 32, row: 20, label: 'Planta' },
    ],
    npc: {
      id: 'npc-ply',
      name: 'PLY-04',
      role: 'Highscore 1UP',
      col: 28,
      row: 13,
      shirtColor: '#06b6d4',
      hairColor: '#f43f5e',
    },
  },
];

/**
 * Resolve which themed room a given app belongs to based on its category.
 */
export function resolveRoomIdForApp(app: WebAppItem): StudioRoomId {
  const cat = app.category.toLowerCase().trim();
  for (const room of STUDIO_ROOMS) {
    if (room.id !== 'central-lobby' && room.categories.includes(cat)) {
      return room.id;
    }
  }
  return 'finance-prod';
}

function getBaseStyleForRoom(
  roomId: StudioRoomId,
  app: WebAppItem
): AppFurnitureStyle {
  if (roomId === 'devtools-ai') return 'cyber';
  if (roomId === 'design-social') return 'design';
  if (roomId === 'arcade-games') {
    return isRacingOrSportsApp(app) ? 'arcade-racing' : 'arcade';
  }
  if (roomId === 'central-lobby') return 'lobby';
  return 'executive';
}

/**
 * Places registered apps onto physical themed furniture stations inside each room.
 * Each room holds up to MAX_ROOM_STATIONS (8) dedicated stations.
 * If a room receives more than 8 apps, the first 7 stations render individual apps
 * and the 8th station becomes a "Servidor Cluster da Sala" containing all overflow apps.
 */
export function assignAppsToRoomDesks(
  apps: WebAppItem[]
): PlacedAppTerminal[] {
  const seenIds = new Set<string>();
  const uniqueApps: WebAppItem[] = [];
  for (const app of apps) {
    if (!app || seenIds.has(app.id)) continue;
    seenIds.add(app.id);
    uniqueApps.push(app);
  }
  const sorted = uniqueApps.sort((a, b) => a.slotIndex - b.slotIndex);
  const groupedByRoom: Record<StudioRoomId, WebAppItem[]> = {
    'central-lobby': [],
    'devtools-ai': [],
    'design-social': [],
    'finance-prod': [],
    'arcade-games': [],
  };

  for (const app of sorted) {
    const roomId = resolveRoomIdForApp(app);
    groupedByRoom[roomId].push(app);
  }

  const placements: PlacedAppTerminal[] = [];
  const themedRoomOrder: StudioRoomId[] = [
    'devtools-ai',
    'design-social',
    'finance-prod',
    'arcade-games',
    'central-lobby',
  ];

  for (const roomId of themedRoomOrder) {
    const roomApps = groupedByRoom[roomId];
    if (roomApps.length === 0) continue;
    const room = STUDIO_ROOMS.find((r) => r.id === roomId)!;
    const maxStations = Math.min(MAX_ROOM_STATIONS, room.deskSlots.length);

    if (roomApps.length <= maxStations) {
      roomApps.forEach((app, idx) => {
        const deskCoord = room.deskSlots[idx];
        placements.push({
          app,
          roomId,
          col: deskCoord.col,
          row: deskCoord.row,
          interactTile: { col: deskCoord.col, row: deskCoord.row + 1 },
          styleVariant: getBaseStyleForRoom(roomId, app),
          isClusterRack: false,
        });
      });
    } else {
      // First (maxStations - 1) stations are individual apps
      const dedicatedCount = maxStations - 1;
      for (let idx = 0; idx < dedicatedCount; idx++) {
        const app = roomApps[idx];
        const deskCoord = room.deskSlots[idx];
        placements.push({
          app,
          roomId,
          col: deskCoord.col,
          row: deskCoord.row,
          interactTile: { col: deskCoord.col, row: deskCoord.row + 1 },
          styleVariant: getBaseStyleForRoom(roomId, app),
          isClusterRack: false,
        });
      }

      // The 8th station (index 7) becomes the Room Cluster Server Rack
      const clusterSlotIdx = dedicatedCount;
      const clusterCoord = room.deskSlots[clusterSlotIdx];
      const overflowApps = roomApps.slice(dedicatedCount);
      placements.push({
        app: overflowApps[0],
        roomId,
        col: clusterCoord.col,
        row: clusterCoord.row,
        interactTile: { col: clusterCoord.col, row: clusterCoord.row + 1 },
        styleVariant: 'cluster-rack',
        isClusterRack: true,
        clusterApps: overflowApps,
      });
    }
  }

  return placements;
}

/**
 * Builds the 34x22 boolean walkability grid (true = blocked / solid obstacle, false = walkable).
 */
export function buildStudioCollisionGrid(
  placedApps: PlacedAppTerminal[]
): boolean[][] {
  const grid: boolean[][] = Array.from({ length: STUDIO_MAP_ROWS }, () =>
    Array(STUDIO_MAP_COLS).fill(false)
  );

  // 1. Outer perimeter walls
  for (let r = 0; r < STUDIO_MAP_ROWS; r++) {
    grid[r][0] = true;
    grid[r][STUDIO_MAP_COLS - 1] = true;
  }
  for (let c = 0; c < STUDIO_MAP_COLS; c++) {
    grid[0][c] = true;
    grid[STUDIO_MAP_ROWS - 1][c] = true;
  }

  // 2. Interior room partition walls with 2-tile doorways
  // Vertical partition left (col 12): Top-Left & Bottom-Left rooms
  for (let r = 1; r <= 9; r++) {
    if (r !== 5 && r !== 6) grid[r][12] = true;
  }
  for (let r = 12; r <= 20; r++) {
    if (r !== 15 && r !== 16) grid[r][12] = true;
  }

  // Vertical partition right (col 21): Top-Right & Bottom-Right rooms
  for (let r = 1; r <= 9; r++) {
    if (r !== 5 && r !== 6) grid[r][21] = true;
  }
  for (let r = 12; r <= 20; r++) {
    if (r !== 15 && r !== 16) grid[r][21] = true;
  }

  // Horizontal corridor walls (row 9 & row 12) for West wing (cols 1..12)
  for (let c = 1; c <= 12; c++) {
    if (c !== 5 && c !== 6) {
      grid[9][c] = true;
      grid[12][c] = true;
    }
  }

  // Horizontal corridor walls (row 9 & row 12) for East wing (cols 21..32)
  for (let c = 21; c <= 32; c++) {
    if (c !== 27 && c !== 28) {
      grid[9][c] = true;
      grid[12][c] = true;
    }
  }

  // 3. Room furniture, NPCs & CRT monitors
  for (const room of STUDIO_ROOMS) {
    for (let dx = 0; dx < room.crtWidthTiles; dx++) {
      grid[room.crtTile.row][room.crtTile.col + dx] = true;
    }
    grid[room.npc.row][room.npc.col] = true;
    for (const prop of room.decorProps) {
      if (prop.walkable) continue;
      const span = prop.widthTiles || 1;
      for (let dx = 0; dx < span; dx++) {
        if (
          prop.row >= 0 &&
          prop.row < STUDIO_MAP_ROWS &&
          prop.col + dx >= 0 &&
          prop.col + dx < STUDIO_MAP_COLS
        ) {
          grid[prop.row][prop.col + dx] = true;
        }
      }
    }
  }

  // 4. Placed App Terminal Machines/Desks
  for (const placed of placedApps) {
    grid[placed.row][placed.col] = true;
  }

  return grid;
}

export function isTileWalkable(
  grid: boolean[][],
  col: number,
  row: number
): boolean {
  if (
    row < 0 ||
    row >= STUDIO_MAP_ROWS ||
    col < 0 ||
    col >= STUDIO_MAP_COLS
  ) {
    return false;
  }
  return !grid[row][col];
}

/**
 * Checks whether a continuous bounding box around (px, py) collides with any blocked tile.
 */
export function isPositionWalkable(
  grid: boolean[][],
  px: number,
  py: number,
  halfBox = 12
): boolean {
  const corners = [
    { x: px - halfBox, y: py - halfBox },
    { x: px + halfBox, y: py - halfBox },
    { x: px - halfBox, y: py + halfBox },
    { x: px + halfBox, y: py + halfBox },
  ];

  for (const pt of corners) {
    const col = Math.floor(pt.x / STUDIO_TILE_SIZE);
    const row = Math.floor(pt.y / STUDIO_TILE_SIZE);
    if (!isTileWalkable(grid, col, row)) {
      return false;
    }
  }
  return true;
}

/**
 * Axis-separated smooth collision movement for WASD / Arrow keys.
 */
export function moveWithCollision(
  grid: boolean[][],
  x: number,
  y: number,
  dx: number,
  dy: number
): { x: number; y: number } {
  let nextX = x;
  let nextY = y;

  if (dx !== 0 && isPositionWalkable(grid, nextX + dx, nextY)) {
    nextX += dx;
  }
  if (dy !== 0 && isPositionWalkable(grid, nextX, nextY + dy)) {
    nextY += dy;
  }

  return { x: nextX, y: nextY };
}

/**
 * Finds the nearest walkable tile to a clicked coordinate (useful if user clicks a wall/desk).
 */
export function findNearestWalkableTile(
  grid: boolean[][],
  targetCol: number,
  targetRow: number
): TileCoord | null {
  const clampedCol = Math.max(1, Math.min(STUDIO_MAP_COLS - 2, targetCol));
  const clampedRow = Math.max(1, Math.min(STUDIO_MAP_ROWS - 2, targetRow));

  if (isTileWalkable(grid, clampedCol, clampedRow)) {
    return { col: clampedCol, row: clampedRow };
  }

  const visited = new Set<string>([`${clampedCol},${clampedRow}`]);
  const queue: TileCoord[] = [{ col: clampedCol, row: clampedRow }];
  const dirs = [
    { dc: 0, dr: 1 },
    { dc: 0, dr: -1 },
    { dc: 1, dr: 0 },
    { dc: -1, dr: 0 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const d of dirs) {
      const nc = curr.col + d.dc;
      const nr = curr.row + d.dr;
      if (nc < 0 || nc >= STUDIO_MAP_COLS || nr < 0 || nr >= STUDIO_MAP_ROWS) {
        continue;
      }
      const key = `${nc},${nr}`;
      if (visited.has(key)) continue;
      if (isTileWalkable(grid, nc, nr)) {
        return { col: nc, row: nr };
      }
      visited.add(key);
      queue.push({ col: nc, row: nr });
    }
  }

  return null;
}

/**
 * Breadth-First Search (BFS) shortest path on the 4-way tile grid.
 */
export function findShortestTilePath(
  grid: boolean[][],
  startCol: number,
  startRow: number,
  goalCol: number,
  goalRow: number
): TileCoord[] {
  const safeStart = findNearestWalkableTile(grid, startCol, startRow);
  const safeGoal = findNearestWalkableTile(grid, goalCol, goalRow);
  if (!safeStart || !safeGoal) return [];
  if (safeStart.col === safeGoal.col && safeStart.row === safeGoal.row) {
    return [];
  }

  const startKey = `${safeStart.col},${safeStart.row}`;
  const goalKey = `${safeGoal.col},${safeGoal.row}`;

  const visited = new Set<string>([startKey]);
  const parent = new Map<string, TileCoord>();
  const queue: TileCoord[] = [safeStart];

  const dirs = [
    { dc: 0, dr: 1 },
    { dc: 1, dr: 0 },
    { dc: 0, dr: -1 },
    { dc: -1, dr: 0 },
  ];

  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currKey = `${curr.col},${curr.row}`;
    if (currKey === goalKey) {
      found = true;
      break;
    }

    for (const d of dirs) {
      const nc = curr.col + d.dc;
      const nr = curr.row + d.dr;
      const nKey = `${nc},${nr}`;
      if (visited.has(nKey)) continue;
      if (!isTileWalkable(grid, nc, nr)) continue;

      visited.add(nKey);
      parent.set(nKey, curr);
      queue.push({ col: nc, row: nr });
    }
  }

  if (!found) return [];

  const path: TileCoord[] = [];
  let traceKey = goalKey;
  let traceCoord: TileCoord = safeGoal;

  while (traceKey !== startKey) {
    path.push(traceCoord);
    const prev = parent.get(traceKey);
    if (!prev) break;
    traceCoord = prev;
    traceKey = `${prev.col},${prev.row}`;
  }

  return path.reverse();
}

/**
 * Identifies which room (or connecting corridor) the player is currently standing in.
 */
export function getRoomAtPosition(px: number, py: number): StudioRoomDef {
  const col = Math.floor(px / STUDIO_TILE_SIZE);
  const row = Math.floor(py / STUDIO_TILE_SIZE);

  for (const room of STUDIO_ROOMS) {
    if (room.id === 'central-lobby') continue;
    const b = room.bounds;
    if (
      col >= b.minCol &&
      col <= b.maxCol &&
      row >= b.minRow &&
      row <= b.maxRow
    ) {
      return room;
    }
  }

  return STUDIO_ROOMS[0];
}

/**
 * Curated walkable waypoints across all 5 rooms and corridors so roaming developer NPCs
 * naturally visit coffee tables, server racks, paired desks, design stations, and arcades.
 */
export const ROAMING_ROOM_WAYPOINTS: Array<{
  roomId: StudioRoomId;
  tile: TileCoord;
  activity: string;
}> = [
  // Central Lobby & Coffee Bar
  { roomId: 'central-lobby', tile: { col: 15, row: 3 }, activity: '☕ Expresso' },
  { roomId: 'central-lobby', tile: { col: 18, row: 4 }, activity: '💬 Daily' },
  { roomId: 'central-lobby', tile: { col: 16, row: 11 }, activity: '🖥️ Retro OS' },
  { roomId: 'central-lobby', tile: { col: 17, row: 16 }, activity: '🥤 Pausa' },
  // Lab DevTools & IA
  { roomId: 'devtools-ai', tile: { col: 3, row: 2 }, activity: '⚡ GPU Log' },
  { roomId: 'devtools-ai', tile: { col: 6, row: 4 }, activity: '🐛 Debug' },
  { roomId: 'devtools-ai', tile: { col: 9, row: 6 }, activity: '🤖 Prompt' },
  // Estúdio Design & Social
  { roomId: 'design-social', tile: { col: 24, row: 4 }, activity: '🎨 Pixel UI' },
  { roomId: 'design-social', tile: { col: 28, row: 4 }, activity: '📸 Assets' },
  { roomId: 'design-social', tile: { col: 26, row: 6 }, activity: '✨ Protótipo' },
  // Escritório Finanças & Ops
  { roomId: 'finance-prod', tile: { col: 5, row: 14 }, activity: '📊 Métricas' },
  { roomId: 'finance-prod', tile: { col: 7, row: 16 }, activity: '📈 Sprint' },
  { roomId: 'finance-prod', tile: { col: 9, row: 14 }, activity: '🖨️ Print 3D' },
  // Salão Arcade & Games
  { roomId: 'arcade-games', tile: { col: 26, row: 16 }, activity: '🕹️ Playtest' },
  { roomId: 'arcade-games', tile: { col: 30, row: 16 }, activity: '🏆 1UP!' },
  { roomId: 'arcade-games', tile: { col: 24, row: 18 }, activity: '🎮 FPS Check' },
];

export const ROAMING_DEV_NPCS: RoamingStudioNPCDef[] = [
  {
    id: 'roam-dev-lucas',
    name: 'LUCAS.TS',
    role: 'Full-Stack Dev',
    shirtColor: '#10b981',
    hairColor: '#fde047',
    pantsColor: '#1e293b',
    accessory: 'glasses',
    spawnTile: { col: 15, row: 6 },
    homeRoomId: 'devtools-ai',
    statusPhrases: ['🚀 Deploy', '☕ Café...', '🐛 Fix PR', '⚡ Build OK'],
  },
  {
    id: 'roam-dev-maya',
    name: 'MAYA.UX',
    role: 'Pixel & UI Designer',
    shirtColor: '#ec4899',
    hairColor: '#38bdf8',
    pantsColor: '#312e81',
    accessory: 'headset',
    spawnTile: { col: 19, row: 6 },
    homeRoomId: 'design-social',
    statusPhrases: ['🎨 Sprites', '✨ Tokens', '📸 Mockup', '💬 Review'],
  },
  {
    id: 'roam-dev-caio',
    name: 'CAIO.OPS',
    role: 'SRE & FinOps',
    shirtColor: '#f59e0b',
    hairColor: '#78350f',
    pantsColor: '#0f172a',
    accessory: 'coffee',
    spawnTile: { col: 7, row: 16 },
    homeRoomId: 'finance-prod',
    statusPhrases: ['📊 KPIs', '📈 Cloud', '☕ Pausa', '🖨️ 3D Mesh'],
  },
  {
    id: 'roam-dev-nina',
    name: 'NINA.QA',
    role: 'Game & QA Eng',
    shirtColor: '#06b6d4',
    hairColor: '#f43f5e',
    pantsColor: '#1e1b4b',
    accessory: 'cap',
    spawnTile: { col: 25, row: 16 },
    homeRoomId: 'arcade-games',
    statusPhrases: ['🕹️ QA Run', '🏆 60 FPS', '🐛 Bug Hunt', '🎮 Arcade'],
  },
  {
    id: 'roam-dev-teo',
    name: 'TEO.AI',
    role: 'Engenheiro IA',
    shirtColor: '#8b5cf6',
    hairColor: '#e2e8f0',
    pantsColor: '#1e293b',
    accessory: 'glasses',
    spawnTile: { col: 7, row: 4 },
    homeRoomId: 'devtools-ai',
    statusPhrases: ['🤖 Agentes', '🧠 RAG Sync', '☕ Expresso', '⚡ Latência'],
  },
];

/**
 * Initializes the roaming developer NPCs with valid walkable positions and initial paths
 * leading into neighbouring rooms so the office immediately feels alive.
 */
export function createInitialRoamingNPCs(
  grid: boolean[][]
): RoamingStudioNPCState[] {
  return ROAMING_DEV_NPCS.map((def, idx) => {
    const startTile =
      findNearestWalkableTile(grid, def.spawnTile.col, def.spawnTile.row) ||
      def.spawnTile;

    // Pick a destination in a different room so each dev immediately walks across corridors
    const targetCandidate =
      ROAMING_ROOM_WAYPOINTS[(idx * 3 + 2) % ROAMING_ROOM_WAYPOINTS.length];
    const destTile =
      findNearestWalkableTile(
        grid,
        targetCandidate.tile.col,
        targetCandidate.tile.row
      ) || startTile;

    const initialPath = findShortestTilePath(
      grid,
      startTile.col,
      startTile.row,
      destTile.col,
      destTile.row
    );

    return {
      id: def.id,
      name: def.name,
      role: def.role,
      shirtColor: def.shirtColor,
      hairColor: def.hairColor,
      pantsColor: def.pantsColor,
      accessory: def.accessory,
      x: (startTile.col + 0.5) * STUDIO_TILE_SIZE,
      y: (startTile.row + 0.5) * STUDIO_TILE_SIZE,
      direction: 'down',
      isMoving: initialPath.length > 0,
      walkFrame: 0,
      stepDist: 0,
      pathQueue: initialPath,
      pauseTimer: idx * 0.35,
      statusText: def.statusPhrases[0],
      targetRoomId: targetCandidate.roomId,
    };
  });
}

/**
 * Pure simulation step for all roaming developer NPCs.
 * Moves NPCs along their BFS tile path between rooms and assigns a new cross-room destination
 * whenever their pause timer expires.
 */
export function stepRoamingNPCs(
  npcs: RoamingStudioNPCState[],
  grid: boolean[][],
  dt: number,
  randomFn: () => number = Math.random
): RoamingStudioNPCState[] {
  const npcSpeed = 92; // Relaxed developer walking pace (px/sec)

  return npcs.map((npc, idx) => {
    const def = ROAMING_DEV_NPCS[idx] || ROAMING_DEV_NPCS[0];

    // 1. If currently paused at a workstation/coffee bar, count down pauseTimer
    if (npc.pauseTimer > 0) {
      const nextTimer = npc.pauseTimer - dt;
      if (nextTimer > 0) {
        return {
          ...npc,
          pauseTimer: nextTimer,
          isMoving: false,
        };
      }

      // Pause finished -> pick a new waypoint (preferring a different room)
      const currentRoom = getRoomAtPosition(npc.x, npc.y).id;
      const otherRoomWaypoints = ROAMING_ROOM_WAYPOINTS.filter(
        (w) => w.roomId !== currentRoom
      );
      const pool =
        otherRoomWaypoints.length > 0
          ? otherRoomWaypoints
          : ROAMING_ROOM_WAYPOINTS;
      const chosen =
        pool[Math.floor(randomFn() * pool.length)] || ROAMING_ROOM_WAYPOINTS[0];

      const currCol = Math.floor(npc.x / STUDIO_TILE_SIZE);
      const currRow = Math.floor(npc.y / STUDIO_TILE_SIZE);
      const nextPath = findShortestTilePath(
        grid,
        currCol,
        currRow,
        chosen.tile.col,
        chosen.tile.row
      );

      const phrase =
        def.statusPhrases[
          Math.floor(randomFn() * def.statusPhrases.length)
        ] || chosen.activity;

      return {
        ...npc,
        pauseTimer: 0,
        pathQueue: nextPath,
        isMoving: nextPath.length > 0,
        statusText: phrase,
        targetRoomId: chosen.roomId,
      };
    }

    // 2. If pathQueue is empty, pause at destination for 2.2s - 4.8s
    if (npc.pathQueue.length === 0) {
      return {
        ...npc,
        isMoving: false,
        pauseTimer: 2.2 + randomFn() * 2.6,
        direction: 'down',
      };
    }

    // 3. Walk smoothly toward next tile waypoint
    const waypoint = npc.pathQueue[0];
    const targetX = (waypoint.col + 0.5) * STUDIO_TILE_SIZE;
    const targetY = (waypoint.row + 0.5) * STUDIO_TILE_SIZE;
    const diffX = targetX - npc.x;
    const diffY = targetY - npc.y;
    const dist = Math.hypot(diffX, diffY);
    const step = npcSpeed * dt;

    let nextDir: CharacterDirection = npc.direction;
    if (Math.abs(diffX) >= Math.abs(diffY)) {
      if (Math.abs(diffX) > 0.5) nextDir = diffX < 0 ? 'left' : 'right';
    } else if (Math.abs(diffY) > 0.5) {
      nextDir = diffY < 0 ? 'up' : 'down';
    }

    if (dist <= step) {
      const remaining = npc.pathQueue.slice(1);
      return {
        ...npc,
        x: targetX,
        y: targetY,
        direction: nextDir,
        isMoving: remaining.length > 0,
        pathQueue: remaining,
        pauseTimer: remaining.length === 0 ? 2.4 + randomFn() * 2.4 : 0,
      };
    }

    const nextStepDist = npc.stepDist + step;
    const toggleFrame = nextStepDist >= 15;

    return {
      ...npc,
      x: npc.x + (diffX / dist) * step,
      y: npc.y + (diffY / dist) * step,
      direction: nextDir,
      isMoving: true,
      walkFrame: toggleFrame ? (npc.walkFrame === 0 ? 1 : 0) : npc.walkFrame,
      stepDist: toggleFrame ? 0 : nextStepDist,
    };
  });
}
