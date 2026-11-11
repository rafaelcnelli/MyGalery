import {
  ACCENT_COLOR_MAP,
  AccentColor,
  TOTAL_GRID_SLOTS,
  WebAppItem,
} from '../types/launcher';

/**
 * Automatically normalizes a user-entered URL by trimming whitespace
 * and prepending https:// if no protocol is present.
 */
export function normalizeAppUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Extracts a clean hostname (e.g. "linear.app") from any raw or normalized URL.
 */
export function extractHostname(rawUrl: string): string {
  const normalized = normalizeAppUrl(rawUrl);
  if (!normalized) return '';
  try {
    const parsed = new URL(normalized);
    return parsed.hostname.toLowerCase();
  } catch {
    // Fallback regex extraction if URL constructor fails while user is typing
    const match = normalized
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      ?.split('?')[0]
      ?.trim()
      .toLowerCase();
    return match && match.includes('.') ? match : '';
  }
}

/**
 * Builds the multi-source logo cascade URLs from a raw URL and optional custom override.
 * Source 1 (Primary): Google S2 Favicons 128px
 * Source 2 (Fallback): DuckDuckGo Icons .ico
 */
export function getFaviconSources(
  rawUrl: string,
  customLogoUrl?: string
): {
  custom: string | null;
  primary: string | null;
  secondary: string | null;
  hostname: string;
} {
  const cleanCustom = customLogoUrl?.trim() ? normalizeAppUrl(customLogoUrl.trim()) : null;
  const hostname = extractHostname(rawUrl);

  if (!hostname) {
    return {
      custom: cleanCustom,
      primary: null,
      secondary: null,
      hostname: '',
    };
  }

  return {
    custom: cleanCustom,
    primary: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`,
    secondary: `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`,
    hostname,
  };
}

/**
 * Extracts 1 or 2 uppercase initials from the app name for stylized monogram fallback.
 */
export function getAppInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return 'AP';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

/**
 * Clamps a slot index strictly within valid bounds [0, TOTAL_GRID_SLOTS - 1].
 */
export function clampSlotIndex(slotIndex: number): number {
  if (!Number.isFinite(slotIndex)) return 0;
  return Math.max(0, Math.min(TOTAL_GRID_SLOTS - 1, Math.floor(slotIndex)));
}

/**
 * Finds the first unoccupied slot in the 40-slot grid.
 * If preferredSlot is provided and free, returns it immediately.
 */
export function findFirstAvailableSlot(
  apps: WebAppItem[],
  preferredSlot?: number | null
): number {
  const occupied = new Set(apps.map((a) => a.slotIndex));
  if (
    preferredSlot !== undefined &&
    preferredSlot !== null &&
    preferredSlot >= 0 &&
    preferredSlot < TOTAL_GRID_SLOTS &&
    !occupied.has(preferredSlot)
  ) {
    return preferredSlot;
  }

  for (let i = 0; i < TOTAL_GRID_SLOTS; i++) {
    if (!occupied.has(i)) {
      return i;
    }
  }
  return 0;
}

/**
 * Guarantees that no two apps occupy the same slotIndex.
 * If duplicates exist (e.g. from imported JSON), reassigns collisions to free slots.
 */
export function deduplicateSlots(apps: WebAppItem[]): WebAppItem[] {
  const usedSlots = new Set<number>();
  const result: WebAppItem[] = [];

  for (const app of apps.slice(0, TOTAL_GRID_SLOTS)) {
    let slot = clampSlotIndex(app.slotIndex);
    if (usedSlots.has(slot)) {
      // Find first free slot
      let found = 0;
      for (let i = 0; i < TOTAL_GRID_SLOTS; i++) {
        if (!usedSlots.has(i)) {
          found = i;
          break;
        }
      }
      slot = found;
    }
    usedSlots.add(slot);
    result.push({ ...app, slotIndex: slot });
  }

  return result;
}

/**
 * Anti-Overlap Rule (Auto-Swap):
 * Moves `appId` to `targetSlotIndex`.
 * If `targetSlotIndex` is already occupied by another app, the two apps
 * automatically swap their `slotIndex` values so two apps never overlap.
 */
export function moveOrSwapAppSlot(
  apps: WebAppItem[],
  appId: string,
  targetSlotIndex: number
): {
  updatedApps: WebAppItem[];
  swappedWithApp: WebAppItem | null;
  didChange: boolean;
} {
  const validTarget = clampSlotIndex(targetSlotIndex);
  const movingApp = apps.find((a) => a.id === appId);
  if (!movingApp) {
    return { updatedApps: apps, swappedWithApp: null, didChange: false };
  }

  const originSlot = movingApp.slotIndex;
  if (originSlot === validTarget) {
    return { updatedApps: apps, swappedWithApp: null, didChange: false };
  }

  const occupantApp = apps.find(
    (a) => a.slotIndex === validTarget && a.id !== appId
  );
  const nowIso = new Date().toISOString();

  const updatedApps = apps.map((app) => {
    if (app.id === appId) {
      return {
        ...app,
        slotIndex: validTarget,
        updatedAt: nowIso,
      };
    }
    if (occupantApp && app.id === occupantApp.id) {
      return {
        ...app,
        slotIndex: originSlot,
        updatedAt: nowIso,
      };
    }
    return app;
  });

  return {
    updatedApps,
    swappedWithApp: occupantApp ?? null,
    didChange: true,
  };
}

/**
 * Places a new or edited app into `targetSlotIndex`.
 * If `targetSlotIndex` is occupied by a different app, swaps the existing occupant
 * to the edited app's previous slot (or the first free slot if creating a new app).
 */
export function upsertAppWithAutoSwap(
  apps: WebAppItem[],
  incomingApp: WebAppItem
): {
  updatedApps: WebAppItem[];
  swappedOccupant: WebAppItem | null;
} {
  const targetSlot = clampSlotIndex(incomingApp.slotIndex);
  const existingSelf = apps.find((a) => a.id === incomingApp.id);
  const occupant = apps.find(
    (a) => a.slotIndex === targetSlot && a.id !== incomingApp.id
  );

  const fallbackSlotForOccupant = existingSelf
    ? existingSelf.slotIndex
    : findFirstAvailableSlot(
        apps.filter((a) => a.id !== incomingApp.id),
        null
      );

  const nowIso = new Date().toISOString();
  const normalizedIncoming: WebAppItem = {
    ...incomingApp,
    slotIndex: targetSlot,
    updatedAt: nowIso,
  };

  let swappedOccupant: WebAppItem | null = null;

  const withoutSelf = apps.filter((a) => a.id !== incomingApp.id);
  const adjustedOthers = withoutSelf.map((app) => {
    if (occupant && app.id === occupant.id) {
      swappedOccupant = {
        ...app,
        slotIndex: fallbackSlotForOccupant,
        updatedAt: nowIso,
      };
      return swappedOccupant;
    }
    return app;
  });

  return {
    updatedApps: [...adjustedOthers, normalizedIncoming],
    swappedOccupant,
  };
}

/**
 * Filters apps by search query (matching name, category, or hostname) and optional category filter.
 */
export function getMatchingAppIds(
  apps: WebAppItem[],
  searchQuery: string,
  categoryFilter: string = 'ALL'
): Set<string> {
  const q = searchQuery.trim().toLowerCase();
  const matched = new Set<string>();

  for (const app of apps) {
    const matchesCategory =
      categoryFilter === 'ALL' ||
      app.category.toLowerCase() === categoryFilter.toLowerCase();

    if (!matchesCategory) continue;

    if (!q) {
      matched.add(app.id);
      continue;
    }

    const hostname = extractHostname(app.url);
    if (
      app.name.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      hostname.includes(q)
    ) {
      matched.add(app.id);
    }
  }

  return matched;
}

/**
 * Sanitizes and enforces strict bounds on a WebAppItem matching firebase-blueprint.json.
 */
export function sanitizeWebAppItem(
  partial: Partial<WebAppItem>,
  ownerId: string = 'local'
): WebAppItem {
  const cleanId = (partial.id || `app-${Date.now()}`)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 64);

  const cleanOwner = (ownerId || partial.ownerId || 'local')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);

  const cleanName = (partial.name || 'Untitled App').trim().slice(0, 80);
  const cleanUrl = normalizeAppUrl(partial.url || 'https://example.com').slice(0, 500);
  const cleanCategory = (partial.category || 'Utilitário').trim().slice(0, 40);
  const validAccent: AccentColor =
    partial.accentColor && partial.accentColor in ACCENT_COLOR_MAP
      ? partial.accentColor
      : 'indigo';
  const cleanCustomLogo = partial.customLogoUrl
    ? normalizeAppUrl(partial.customLogoUrl).slice(0, 500)
    : '';
  const slotIndex = clampSlotIndex(partial.slotIndex ?? 0);
  const nowIso = new Date().toISOString();

  return {
    id: cleanId,
    ownerId: cleanOwner,
    name: cleanName,
    url: cleanUrl,
    category: cleanCategory,
    accentColor: validAccent,
    customLogoUrl: cleanCustomLogo,
    slotIndex,
    createdAt: partial.createdAt || nowIso,
    updatedAt: partial.updatedAt || nowIso,
  };
}

export interface HexSpiralCoord {
  index: number;
  q: number;
  r: number;
  ring: number;
  x: number;
  y: number;
}

/**
 * Generates `count` hexagonal honeycomb coordinates spiraling out from the center (0,0)
 * in concentric rings (0 = center, Ring 1 = 6 bubbles, Ring 2 = 12 bubbles, etc.),
 * matching the watchOS spherical app launcher layout.
 */
export function generateHexSpiralCoordinates(
  count: number,
  spacing: number = 96
): HexSpiralCoord[] {
  if (count <= 0) return [];
  const results: HexSpiralCoord[] = [
    { index: 0, q: 0, r: 0, ring: 0, x: 0, y: 0 },
  ];

  // Axial direction vectors for traversing a hex ring
  const directions: [number, number][] = [
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
  ];

  let ring = 1;
  while (results.length < count) {
    let q = 0;
    let r = -ring;
    for (let side = 0; side < 6 && results.length < count; side++) {
      const [dq, dr] = directions[side];
      for (let step = 0; step < ring && results.length < count; step++) {
        // Pointy-top axial to 2D pixel conversion
        const x = spacing * (q + r * 0.5);
        const y = spacing * (r * (Math.sqrt(3) / 2));
        results.push({
          index: results.length,
          q,
          r,
          ring,
          x,
          y,
        });
        q += dq;
        r += dr;
      }
    }
    ring++;
  }

  return results;
}

export interface SphericalProjectedBubble {
  screenX: number;
  screenY: number;
  scale: number;
  opacity: number;
  zIndex: number;
  normalizedDist: number;
}

/**
 * Applies a 3D spherical fish-eye lens transformation to a 2D world coordinate (worldX, worldY)
 * given the current pan offset (panX, panY) and sphere radius.
 * Bubbles near the center (0,0) magnify; bubbles toward the edge curve inward and scale down.
 */
export function projectSphericalBubble(
  worldX: number,
  worldY: number,
  panX: number,
  panY: number,
  sphereRadius: number,
  zoom: number = 1
): SphericalProjectedBubble {
  const safeRadius = Math.max(120, sphereRadius);
  const dx = (worldX + panX) * zoom;
  const dy = (worldY + panY) * zoom;
  const dist = Math.hypot(dx, dy);
  const u = dist / safeRadius;

  if (dist < 0.001) {
    return {
      screenX: 0,
      screenY: 0,
      scale: Math.min(1.32, 1.18 * zoom),
      opacity: 1,
      zIndex: 120,
      normalizedDist: 0,
    };
  }

  // Clamp normalized radial distance so outer bubbles compress smoothly on the sphere horizon
  const clampedU = Math.min(u, 1.22);
  const angle = Math.min(clampedU, 1.05) * (Math.PI / 2);

  // Spherical radial projection: sin(angle) curves outer rings inward like a 3D globe
  const projectedRadius =
    u <= 1.05
      ? safeRadius * Math.sin(angle) * 0.88
      : safeRadius * 0.88 + (dist - safeRadius) * 0.18;

  const ratio = projectedRadius / dist;
  const screenX = dx * ratio;
  const screenY = dy * ratio;

  // Center bubbles are largest (~1.18x), tapering down to ~0.32x at the horizon edge
  const rawScale =
    u <= 1.08
      ? Math.cos(angle * 0.8) * 1.16 + 0.02
      : Math.max(0.24, 0.36 - (u - 1.08) * 0.45);
  const scale = Math.max(0.24, Math.min(1.35, rawScale * Math.pow(zoom, 0.45)));

  const opacity =
    u <= 0.92 ? 1 : Math.max(0.2, 1 - (u - 0.92) * 2.4);

  const zIndex = Math.max(1, Math.round((1.5 - Math.min(u, 1.4)) * 80));

  return {
    screenX,
    screenY,
    scale,
    opacity,
    zIndex,
    normalizedDist: u,
  };
}

/**
 * Calculates the visible slot count and row count for the single-page zero-scroll grid
 * based on the chosen number of columns per row (2, 3, 4, 6, or 8) and currently occupied slots.
 */
export function computeSinglePageGridMetrics(
  gridColumns: 2 | 3 | 4 | 6 | 8,
  apps: WebAppItem[]
): {
  columns: number;
  rows: number;
  visibleSlotCount: number;
} {
  const baseRows =
    gridColumns <= 3 ? 4 : gridColumns === 4 ? 5 : gridColumns === 6 ? 4 : 5;
  const maxOccupiedSlot = apps.reduce(
    (max, app) => Math.max(max, app.slotIndex),
    0
  );
  const neededRowsForApps = Math.floor(maxOccupiedSlot / gridColumns) + 1;
  const rows = Math.min(
    Math.ceil(TOTAL_GRID_SLOTS / gridColumns),
    Math.max(baseRows, neededRowsForApps)
  );
  const visibleSlotCount = Math.min(TOTAL_GRID_SLOTS, gridColumns * rows);

  return {
    columns: gridColumns,
    rows,
    visibleSlotCount,
  };
}

