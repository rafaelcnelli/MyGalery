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

export interface StudioDecorProp {
  id: string;
  kind:
    | 'server-rack'
    | 'terminal-wall'
    | 'art-easel'
    | 'rgb-lamp'
    | 'palette-table'
    | 'printer-3d'
    | 'chart-board'
    | 'calculator-desk'
    | 'arcade-cabinet'
    | 'cockpit-sim'
    | 'coffee-bar'
    | 'sofa'
    | 'plant';
  col: number;
  row: number;
  widthTiles?: number;
  label?: string;
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

export interface StudioRoomDef {
  id: StudioRoomId;
  title: string;
  shortTitle: string;
  subtitle: string;
  categoryFilter: string;
  categories: string[];
  accentHex: string;
  floorClass: string;
  borderHex: string;
  bounds: { minCol: number; maxCol: number; minRow: number; maxRow: number };
  centerTile: TileCoord;
  crtTile: TileCoord;
  crtInteractTile: TileCoord;
  crtWidthTiles: number;
  deskSlots: TileCoord[];
  decorProps: StudioDecorProp[];
  npc: StudioNPCDef;
}

export interface PlacedAppTerminal {
  app: WebAppItem;
  roomId: StudioRoomId;
  col: number;
  row: number;
  interactTile: TileCoord;
  styleVariant: 'cyber' | 'design' | 'executive' | 'arcade' | 'lobby';
}

export const PLAYER_SPAWN_POS = {
  x: 16.5 * STUDIO_TILE_SIZE,
  y: 12.2 * STUDIO_TILE_SIZE,
};

export const STUDIO_ROOMS: StudioRoomDef[] = [
  {
    id: 'central-lobby',
    title: 'Salão Central & Monitor CRT',
    shortTitle: 'Salão Central',
    subtitle: 'Hub Principal · Cafeteria · Retro OS (40 Slots)',
    categoryFilter: 'ALL',
    categories: [],
    accentHex: '#fbbf24',
    floorClass: 'studio-floor-lobby',
    borderHex: 'rgba(251, 191, 36, 0.45)',
    bounds: { minCol: 13, maxCol: 20, minRow: 1, maxRow: 20 },
    centerTile: { col: 16, row: 12 },
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
      { id: 'coffee', kind: 'coffee-bar', col: 15, row: 2, widthTiles: 3, label: 'Café' },
      { id: 'plant-nw', kind: 'plant', col: 14, row: 2 },
      { id: 'plant-ne', kind: 'plant', col: 19, row: 2 },
      { id: 'sofa', kind: 'sofa', col: 15, row: 18, widthTiles: 4, label: 'Lounge' },
      { id: 'plant-sw', kind: 'plant', col: 14, row: 18 },
      { id: 'plant-se', kind: 'plant', col: 19, row: 18 },
    ],
    npc: {
      id: 'npc-chief',
      name: 'ARCH-00',
      role: 'Anfitrião do Hub',
      col: 18,
      row: 4,
      shirtColor: '#6366f1',
      hairColor: '#f8fafc',
    },
  },
  {
    id: 'devtools-ai',
    title: 'Lab DevTools & IA',
    shortTitle: 'Dev & IA',
    subtitle: 'Servidores Cyber · Terminais LLM',
    categoryFilter: 'DevTools,IA',
    categories: ['devtools', 'ia'],
    accentHex: '#10b981',
    floorClass: 'studio-floor-devtools',
    borderHex: 'rgba(16, 185, 129, 0.5)',
    bounds: { minCol: 1, maxCol: 11, minRow: 1, maxRow: 8 },
    centerTile: { col: 6, row: 4 },
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
      { col: 6, row: 5 },
      { col: 8, row: 5 },
      { col: 2, row: 7 },
      { col: 4, row: 7 },
      { col: 8, row: 7 },
      { col: 10, row: 7 },
    ],
    decorProps: [
      { id: 'srv-1', kind: 'server-rack', col: 1, row: 1, label: 'Node 01' },
      { id: 'srv-2', kind: 'server-rack', col: 2, row: 1, label: 'GPU Cluster' },
      { id: 'term-1', kind: 'terminal-wall', col: 5, row: 1, widthTiles: 2, label: 'LLM Matrix' },
      { id: 'plant-dev', kind: 'plant', col: 1, row: 8 },
    ],
    npc: {
      id: 'npc-dev',
      name: 'DEV-01',
      role: 'Compilando IA',
      col: 3,
      row: 1,
      shirtColor: '#10b981',
      hairColor: '#fbbf24',
    },
  },
  {
    id: 'design-social',
    title: 'Ateliê Design & Social',
    shortTitle: 'Design & Social',
    subtitle: 'Mesa Digitalizadora · Quadros · RGB',
    categoryFilter: 'Design,Social,Cliente',
    categories: ['design', 'social', 'cliente'],
    accentHex: '#d946ef',
    floorClass: 'studio-floor-design',
    borderHex: 'rgba(217, 70, 239, 0.5)',
    bounds: { minCol: 22, maxCol: 32, minRow: 1, maxRow: 8 },
    centerTile: { col: 27, row: 4 },
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
      { col: 27, row: 5 },
      { col: 29, row: 5 },
      { col: 31, row: 5 },
      { col: 23, row: 7 },
      { col: 25, row: 7 },
      { col: 29, row: 7 },
      { col: 31, row: 7 },
    ],
    decorProps: [
      { id: 'easel-1', kind: 'art-easel', col: 22, row: 1, label: 'Canvas' },
      { id: 'rgb-1', kind: 'rgb-lamp', col: 23, row: 1, label: 'RGB' },
      { id: 'palette-1', kind: 'palette-table', col: 26, row: 1, widthTiles: 2, label: 'Galeria' },
      { id: 'plant-des', kind: 'plant', col: 32, row: 8 },
    ],
    npc: {
      id: 'npc-art',
      name: 'ART-02',
      role: 'Criando Sprites',
      col: 24,
      row: 1,
      shirtColor: '#d946ef',
      hairColor: '#38bdf8',
    },
  },
  {
    id: 'finance-prod',
    title: 'Escritório Finanças & Ops',
    shortTitle: 'Finanças & Ops',
    subtitle: 'Gráficos · Calculadora · Impressora 3D',
    categoryFilter: 'Finanças,Produtividade,Utilitário,SaaS',
    categories: ['finanças', 'produtividade', 'utilitário', 'saas'],
    accentHex: '#f59e0b',
    floorClass: 'studio-floor-finance',
    borderHex: 'rgba(245, 158, 11, 0.5)',
    bounds: { minCol: 1, maxCol: 11, minRow: 13, maxRow: 20 },
    centerTile: { col: 6, row: 17 },
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
      { col: 6, row: 17 },
      { col: 8, row: 17 },
      { col: 10, row: 17 },
      { col: 2, row: 19 },
      { col: 4, row: 19 },
      { col: 8, row: 19 },
      { col: 10, row: 19 },
    ],
    decorProps: [
      { id: 'print-3d', kind: 'printer-3d', col: 1, row: 13, label: '3D Print' },
      { id: 'calc-1', kind: 'calculator-desk', col: 2, row: 13, label: 'Ledger' },
      { id: 'chart-1', kind: 'chart-board', col: 8, row: 13, label: 'Métricas' },
      { id: 'plant-fin', kind: 'plant', col: 1, row: 20 },
    ],
    npc: {
      id: 'npc-ops',
      name: 'OPS-03',
      role: 'Análise & 3D',
      col: 3,
      row: 13,
      shirtColor: '#f59e0b',
      hairColor: '#a855f7',
    },
  },
  {
    id: 'arcade-games',
    title: 'Salão Arcade & Games',
    shortTitle: 'Arcade & Games',
    subtitle: 'Fliperamas 16-Bit · Cockpit Simulador',
    categoryFilter: 'Game',
    categories: ['game'],
    accentHex: '#06b6d4',
    floorClass: 'studio-floor-arcade',
    borderHex: 'rgba(6, 182, 212, 0.5)',
    bounds: { minCol: 22, maxCol: 32, minRow: 13, maxRow: 20 },
    centerTile: { col: 27, row: 17 },
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
      { col: 27, row: 17 },
      { col: 29, row: 17 },
      { col: 31, row: 17 },
      { col: 23, row: 19 },
      { col: 25, row: 19 },
      { col: 29, row: 19 },
      { col: 31, row: 19 },
    ],
    decorProps: [
      { id: 'cockpit-1', kind: 'cockpit-sim', col: 22, row: 13, widthTiles: 2, label: 'Cockpit' },
      { id: 'arc-prop', kind: 'arcade-cabinet', col: 25, row: 13, label: '1UP' },
      { id: 'plant-arc', kind: 'plant', col: 32, row: 20 },
    ],
    npc: {
      id: 'npc-ply',
      name: 'PLY-04',
      role: 'Highscore 1UP',
      col: 29,
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

/**
 * Places every registered app onto a physical desk inside its themed room,
 * guaranteeing a walkable adjacent interaction tile for the character.
 */
export function assignAppsToRoomDesks(
  apps: WebAppItem[]
): PlacedAppTerminal[] {
  const sorted = [...apps].sort((a, b) => a.slotIndex - b.slotIndex);
  const usedPerRoom: Record<StudioRoomId, number> = {
    'central-lobby': 0,
    'devtools-ai': 0,
    'design-social': 0,
    'finance-prod': 0,
    'arcade-games': 0,
  };

  const placements: PlacedAppTerminal[] = [];

  for (const app of sorted) {
    let targetRoomId = resolveRoomIdForApp(app);
    let room = STUDIO_ROOMS.find((r) => r.id === targetRoomId)!;
    let slotIdx = usedPerRoom[targetRoomId];

    // Overflow fallback into central-lobby or other rooms if a single category exceeds 13 apps
    if (slotIdx >= room.deskSlots.length) {
      const fallbackOrder: StudioRoomId[] = [
        'central-lobby',
        'finance-prod',
        'devtools-ai',
        'design-social',
        'arcade-games',
      ];
      for (const candidateId of fallbackOrder) {
        const candidateRoom = STUDIO_ROOMS.find((r) => r.id === candidateId)!;
        if (usedPerRoom[candidateId] < candidateRoom.deskSlots.length) {
          targetRoomId = candidateId;
          room = candidateRoom;
          slotIdx = usedPerRoom[candidateId];
          break;
        }
      }
    }

    if (slotIdx >= room.deskSlots.length) continue;

    const deskCoord = room.deskSlots[slotIdx];
    usedPerRoom[targetRoomId] = slotIdx + 1;

    const styleVariant: PlacedAppTerminal['styleVariant'] =
      targetRoomId === 'devtools-ai'
        ? 'cyber'
        : targetRoomId === 'design-social'
          ? 'design'
          : targetRoomId === 'arcade-games'
            ? 'arcade'
            : targetRoomId === 'central-lobby'
              ? 'lobby'
              : 'executive';

    placements.push({
      app,
      roomId: targetRoomId,
      col: deskCoord.col,
      row: deskCoord.row,
      // Walkable tile directly in front (row + 1) of the desk
      interactTile: { col: deskCoord.col, row: deskCoord.row + 1 },
      styleVariant,
    });
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

  // 4. Placed App Terminal Desks
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

  // Prefer cardinal steps
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

  return STUDIO_ROOMS[0]; // central-lobby (includes connecting corridors)
}
