import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAppUrl,
  extractHostname,
  getFaviconSources,
  getAppInitials,
  moveOrSwapAppSlot,
  upsertAppWithAutoSwap,
  deduplicateSlots,
  getMatchingAppIds,
  sanitizeWebAppItem,
  generateHexSpiralCoordinates,
  projectSphericalBubble,
  computeSinglePageGridMetrics,
  formatSlotNumber,
  sortAppsWithMagneticFilter,
  paginateGridSlots,
  buildFixedSlotArray,
  mergeAndRecoverApps,
} from './launcherLogic';
import { INITIAL_DEMO_APPS, WebAppItem } from '../types/launcher';

test('normalizeAppUrl automatically prepends https:// when missing', () => {
  assert.equal(normalizeAppUrl('raycast.com'), 'https://raycast.com');
  assert.equal(normalizeAppUrl('  linear.app/features  '), 'https://linear.app/features');
  assert.equal(normalizeAppUrl('http://localhost:8080'), 'http://localhost:8080');
  assert.equal(normalizeAppUrl('https://vercel.com'), 'https://vercel.com');
  assert.equal(normalizeAppUrl(''), '');
});

test('extractHostname extracts clean lowercase domain from URLs', () => {
  assert.equal(extractHostname('https://www.GitHub.com/explore'), 'www.github.com');
  assert.equal(extractHostname('excalidraw.com/board/123'), 'excalidraw.com');
  assert.equal(extractHostname(''), '');
});

test('getFaviconSources returns primary Google S2 128px and secondary DuckDuckGo URLs', () => {
  const sources = getFaviconSources('linear.app');
  assert.equal(sources.hostname, 'linear.app');
  assert.equal(
    sources.primary,
    'https://www.google.com/s2/favicons?domain=linear.app&sz=128'
  );
  assert.equal(sources.secondary, 'https://icons.duckduckgo.com/ip3/linear.app.ico');
  assert.equal(sources.custom, null);

  // Subpath GitHub Pages app prioritizes direct subpath icons first
  const ghPagesSources = getFaviconSources(
    'https://rafaelnel.github.io/Infiltrados_na_fe/'
  );
  assert.equal(
    ghPagesSources.candidates[0]?.url,
    'https://rafaelnel.github.io/Infiltrados_na_fe/apple-touch-icon.png'
  );
  assert.equal(
    ghPagesSources.candidates[1]?.url,
    'https://rafaelnel.github.io/Infiltrados_na_fe/favicon.svg'
  );
});

test('getAppInitials generates clean 1-2 character uppercase monograms', () => {
  assert.equal(getAppInitials('Linear'), 'LI');
  assert.equal(getAppInitials('Vercel Cloud'), 'VC');
  assert.equal(getAppInitials('  My Web Hub  '), 'MW');
});

test('moveOrSwapAppSlot moves an app to an empty slot without affecting other apps', () => {
  const demo = structuredClone(INITIAL_DEMO_APPS);
  // Move Linear from slot 0 to empty slot 1
  const { updatedApps, swappedWithApp, didChange } = moveOrSwapAppSlot(
    demo,
    'demo-app-linear',
    1
  );
  assert.equal(didChange, true);
  assert.equal(swappedWithApp, null);
  const moved = updatedApps.find((a) => a.id === 'demo-app-linear');
  assert.equal(moved?.slotIndex, 1);
});

test('moveOrSwapAppSlot automatically swaps positions when dropping onto an occupied slot (Anti-Overlap)', () => {
  const demo = structuredClone(INITIAL_DEMO_APPS);
  // Slot 0 has Linear, Slot 2 has Excalidraw. Drop Linear onto Slot 2:
  const { updatedApps, swappedWithApp, didChange } = moveOrSwapAppSlot(
    demo,
    'demo-app-linear',
    2
  );
  assert.equal(didChange, true);
  assert.equal(swappedWithApp?.id, 'demo-app-excalidraw');

  const linear = updatedApps.find((a) => a.id === 'demo-app-linear');
  const excalidraw = updatedApps.find((a) => a.id === 'demo-app-excalidraw');
  assert.equal(linear?.slotIndex, 2);
  assert.equal(excalidraw?.slotIndex, 0);

  // Verify no two apps share a slotIndex
  const slots = updatedApps.map((a) => a.slotIndex);
  assert.equal(new Set(slots).size, slots.length);
});

test('upsertAppWithAutoSwap places a new app in an occupied slot and moves previous occupant to free slot', () => {
  const demo = structuredClone(INITIAL_DEMO_APPS);
  const newApp: WebAppItem = sanitizeWebAppItem({
    id: 'app-raycast',
    name: 'Raycast',
    url: 'raycast.com',
    category: 'Utilitário',
    accentColor: 'rose',
    slotIndex: 0, // Currently occupied by Linear
  });

  const { updatedApps, swappedOccupant } = upsertAppWithAutoSwap(demo, newApp);
  assert.equal(swappedOccupant?.id, 'demo-app-linear');
  assert.equal(swappedOccupant?.slotIndex, 1); // First free slot is 1
  const raycast = updatedApps.find((a) => a.id === 'app-raycast');
  assert.equal(raycast?.slotIndex, 0);

  // Verify zero slot collisions
  const slots = updatedApps.map((a) => a.slotIndex);
  assert.equal(new Set(slots).size, slots.length);
});

test('deduplicateSlots resolves any colliding slot indices', () => {
  const colliding: WebAppItem[] = [
    sanitizeWebAppItem({ id: 'a1', name: 'A1', slotIndex: 3 }),
    sanitizeWebAppItem({ id: 'a2', name: 'A2', slotIndex: 3 }),
    sanitizeWebAppItem({ id: 'a3', name: 'A3', slotIndex: 3 }),
  ];
  const deduped = deduplicateSlots(colliding);
  const slots = deduped.map((a) => a.slotIndex);
  assert.equal(new Set(slots).size, 3);
  assert.deepEqual(slots, [3, 0, 1]);
});

test('getMatchingAppIds filters by search query, #slot number, and category', () => {
  const matchedByName = getMatchingAppIds(INITIAL_DEMO_APPS, 'excali', 'ALL');
  assert.equal(matchedByName.size, 1);
  assert.equal(matchedByName.has('demo-app-excalidraw'), true);

  const matchedByCategory = getMatchingAppIds(INITIAL_DEMO_APPS, '', 'DevTools');
  assert.equal(matchedByCategory.has('demo-app-vercel'), true);

  const matchedByMultiStation = getMatchingAppIds(INITIAL_DEMO_APPS, '', 'DevTools,Design');
  assert.equal(matchedByMultiStation.has('demo-app-vercel'), true);
  assert.equal(matchedByMultiStation.has('demo-app-excalidraw'), true);

  const matchedBySlot = getMatchingAppIds(INITIAL_DEMO_APPS, '#01', 'Todas');
  assert.equal(matchedBySlot.size, 1);
  assert.equal(matchedBySlot.has('demo-app-linear'), true);
});

test('formatSlotNumber, sortAppsWithMagneticFilter, and paginateGridSlots work accurately', () => {
  assert.equal(formatSlotNumber(0), '01');
  assert.equal(formatSlotNumber(39), '40');

  const matching = new Set(['demo-app-vercel']);
  const sorted = sortAppsWithMagneticFilter(INITIAL_DEMO_APPS, matching, true);
  assert.equal(sorted[0].id, 'demo-app-vercel');

  const slots = buildFixedSlotArray(INITIAL_DEMO_APPS);
  const pages = paginateGridSlots(slots, 16);
  assert.equal(pages.length, 3);
  assert.equal(pages[0].length, 16);
  assert.equal(pages[1].length, 16);
  assert.equal(pages[2].length, 8);
});

test('generateHexSpiralCoordinates creates watchOS concentric hexagonal rings', () => {
  const coords = generateHexSpiralCoordinates(19, 90);
  assert.equal(coords.length, 19);
  assert.equal(coords[0].ring, 0);
  assert.equal(coords[0].x, 0);
  assert.equal(coords[0].y, 0);
  for (let i = 1; i <= 6; i++) {
    assert.equal(coords[i].ring, 1);
  }
  for (let i = 7; i <= 18; i++) {
    assert.equal(coords[i].ring, 2);
  }
});

test('projectSphericalBubble magnifies center bubbles and tapers outer bubbles along sphere curve', () => {
  const centerProj = projectSphericalBubble(0, 0, 0, 0, 300, 1);
  const midProj = projectSphericalBubble(140, 0, 0, 0, 300, 1);
  const edgeProj = projectSphericalBubble(290, 0, 0, 0, 300, 1);

  assert.ok(centerProj.scale > midProj.scale);
  assert.ok(midProj.scale > edgeProj.scale);
  assert.ok(centerProj.zIndex > edgeProj.zIndex);
});

test('computeSinglePageGridMetrics supports 4 apps per row while keeping all demo apps visible', () => {
  const metrics4 = computeSinglePageGridMetrics(4, INITIAL_DEMO_APPS);
  assert.equal(metrics4.columns, 4);
  assert.equal(metrics4.rows, 5);
  assert.equal(metrics4.visibleSlotCount, 20);
});

test('mergeAndRecoverApps preserves user custom apps and removes colliding demo-app seeds', () => {
  const userCustomAtSlot0 = sanitizeWebAppItem({
    id: 'app-user-1',
    name: 'Infiltrados na Fé',
    url: 'https://rafaelnel.github.io/Infiltrados_na_fe/',
    category: 'Game',
    accentColor: 'amber',
    slotIndex: 0, // Same slot as demo-app-linear
  });

  const { apps, localOnlyCustomApps, collidingDemoIdsToRemove } =
    mergeAndRecoverApps([userCustomAtSlot0], INITIAL_DEMO_APPS);

  const slot0App = apps.find((a) => a.slotIndex === 0);
  assert.equal(slot0App?.id, 'app-user-1');
  assert.equal(localOnlyCustomApps.length, 1);
  assert.equal(collidingDemoIdsToRemove.includes('demo-app-linear'), true);
});


