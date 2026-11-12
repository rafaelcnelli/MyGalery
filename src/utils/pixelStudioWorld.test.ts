import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STUDIO_ROOMS,
  STUDIO_TILE_SIZE,
  PLAYER_SPAWN_POS,
  assignAppsToRoomDesks,
  buildStudioCollisionGrid,
  findShortestTilePath,
  getRoomAtPosition,
  isPositionWalkable,
} from './pixelStudioWorld';
import { INITIAL_DEMO_APPS, WebAppItem } from '../types/launcher';
import { sanitizeWebAppItem } from './launcherLogic';

test('assignAppsToRoomDesks routes each app to its themed room with a walkable interactTile', () => {
  const apps: WebAppItem[] = [
    ...INITIAL_DEMO_APPS,
    sanitizeWebAppItem({
      id: 'app-game-1',
      name: 'Celeste Web',
      url: 'https://celeste.example.com',
      category: 'Game',
      slotIndex: 5,
    }),
    sanitizeWebAppItem({
      id: 'app-ia-1',
      name: 'Claude',
      url: 'https://claude.ai',
      category: 'IA',
      slotIndex: 6,
    }),
  ];

  const placed = assignAppsToRoomDesks(apps);
  assert.equal(placed.length, apps.length);

  const byId = new Map(placed.map((p) => [p.app.id, p]));
  assert.equal(byId.get('demo-app-vercel')?.roomId, 'devtools-ai');
  assert.equal(byId.get('app-ia-1')?.roomId, 'devtools-ai');
  assert.equal(byId.get('demo-app-excalidraw')?.roomId, 'design-social');
  assert.equal(byId.get('demo-app-linear')?.roomId, 'finance-prod');
  assert.equal(byId.get('demo-app-wikipedia')?.roomId, 'finance-prod');
  assert.equal(byId.get('app-game-1')?.roomId, 'arcade-games');

  const grid = buildStudioCollisionGrid(placed);
  const startCol = Math.floor(PLAYER_SPAWN_POS.x / STUDIO_TILE_SIZE);
  const startRow = Math.floor(PLAYER_SPAWN_POS.y / STUDIO_TILE_SIZE);

  for (const item of placed) {
    const path = findShortestTilePath(
      grid,
      startCol,
      startRow,
      item.interactTile.col,
      item.interactTile.row
    );
    assert.ok(
      path.length > 0,
      `Expected valid corridor path to app ${item.app.name} in room ${item.roomId}`
    );
  }
});

test('all 5 themed rooms and CRT portals are reachable from player spawn via corridors', () => {
  const placed = assignAppsToRoomDesks(INITIAL_DEMO_APPS);
  const grid = buildStudioCollisionGrid(placed);
  const startCol = Math.floor(PLAYER_SPAWN_POS.x / STUDIO_TILE_SIZE);
  const startRow = Math.floor(PLAYER_SPAWN_POS.y / STUDIO_TILE_SIZE);

  for (const room of STUDIO_ROOMS) {
    const pathToCenter = findShortestTilePath(
      grid,
      startCol,
      startRow,
      room.centerTile.col,
      room.centerTile.row
    );
    if (
      room.centerTile.col !== startCol ||
      room.centerTile.row !== startRow
    ) {
      assert.ok(
        pathToCenter.length > 0,
        `Room ${room.id} center should be reachable`
      );
    }

    const pathToCRT = findShortestTilePath(
      grid,
      startCol,
      startRow,
      room.crtInteractTile.col,
      room.crtInteractTile.row
    );
    assert.ok(
      pathToCRT.length > 0,
      `Room ${room.id} CRT terminal should be reachable`
    );
  }
});

test('collision grid blocks partition walls while allowing movement through doorways', () => {
  const grid = buildStudioCollisionGrid([]);
  // Solid wall between Central Lobby and DevTools room at col 12, row 2
  assert.equal(
    isPositionWalkable(grid, 12.5 * STUDIO_TILE_SIZE, 2.5 * STUDIO_TILE_SIZE),
    false
  );
  // Open doorway between Central Lobby and DevTools room at col 12, row 5
  assert.equal(
    isPositionWalkable(grid, 12.5 * STUDIO_TILE_SIZE, 5.5 * STUDIO_TILE_SIZE),
    true
  );
});

test('getRoomAtPosition accurately reports current room when character enters', () => {
  assert.equal(
    getRoomAtPosition(6 * STUDIO_TILE_SIZE, 4 * STUDIO_TILE_SIZE).id,
    'devtools-ai'
  );
  assert.equal(
    getRoomAtPosition(27 * STUDIO_TILE_SIZE, 4 * STUDIO_TILE_SIZE).id,
    'design-social'
  );
  assert.equal(
    getRoomAtPosition(6 * STUDIO_TILE_SIZE, 17 * STUDIO_TILE_SIZE).id,
    'finance-prod'
  );
  assert.equal(
    getRoomAtPosition(27 * STUDIO_TILE_SIZE, 17 * STUDIO_TILE_SIZE).id,
    'arcade-games'
  );
  assert.equal(
    getRoomAtPosition(PLAYER_SPAWN_POS.x, PLAYER_SPAWN_POS.y).id,
    'central-lobby'
  );
});
