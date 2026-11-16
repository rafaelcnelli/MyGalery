import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STUDIO_ROOMS,
  STUDIO_TILE_SIZE,
  PLAYER_SPAWN_POS,
  assignAppsToRoomDesks,
  buildStudioCollisionGrid,
  createInitialRoamingNPCs,
  findShortestTilePath,
  getRoomAtPosition,
  isPositionWalkable,
  stepRoamingNPCs,
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
  assert.equal(byId.get('demo-app-wikipedia')?.roomId, 'devtools-ai');
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

test('assignAppsToRoomDesks converts 8th station into Cluster Server Rack when a room has > 8 apps', () => {
  const tenGames = Array.from({ length: 10 }, (_, idx) =>
    sanitizeWebAppItem({
      id: `game-${idx}`,
      name: `Arcade Game ${idx + 1}`,
      url: `https://game${idx}.example.com`,
      category: 'Game',
      slotIndex: idx,
    })
  );

  const placed = assignAppsToRoomDesks(tenGames);
  assert.equal(placed.length, 8);
  const eighth = placed[7];
  assert.equal(eighth.isClusterRack, true);
  assert.equal(eighth.styleVariant, 'cluster-rack');
  assert.equal(eighth.clusterApps?.length, 3);
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

test('assignAppsToRoomDesks assigns arcade-racing cockpit to racing/sports games and arcade cabinet to other games', () => {
  const apps: WebAppItem[] = [
    sanitizeWebAppItem({
      id: 'game-apex',
      name: 'Apex Racing',
      url: 'https://apex-racing.example.com',
      category: 'Game',
      slotIndex: 1,
    }),
    sanitizeWebAppItem({
      id: 'game-futebol',
      name: 'Estrelato Futebol',
      url: 'https://futebol.example.com',
      category: 'Game',
      slotIndex: 2,
    }),
    sanitizeWebAppItem({
      id: 'game-puzzle',
      name: 'Retro Quest',
      url: 'https://quest.example.com',
      category: 'Game',
      slotIndex: 3,
    }),
  ];

  const placed = assignAppsToRoomDesks(apps);
  const byId = new Map(placed.map((p) => [p.app.id, p]));
  assert.equal(byId.get('game-apex')?.styleVariant, 'arcade-racing');
  assert.equal(byId.get('game-futebol')?.styleVariant, 'arcade-racing');
  assert.equal(byId.get('game-puzzle')?.styleVariant, 'arcade');
});

test('roaming developer NPCs initialize on walkable tiles and autonomously walk between rooms', () => {
  const placed = assignAppsToRoomDesks(INITIAL_DEMO_APPS);
  const grid = buildStudioCollisionGrid(placed);
  let npcs = createInitialRoamingNPCs(grid);

  assert.equal(npcs.length, 5);
  for (const npc of npcs) {
    assert.ok(npc.pathQueue.length > 0, `NPC ${npc.id} should have an initial cross-room path`);
  }

  const startPositions = npcs.map((n) => ({ x: n.x, y: n.y }));

  // Simulate 3 seconds of movement (60 frames at 50ms)
  for (let i = 0; i < 60; i++) {
    npcs = stepRoamingNPCs(npcs, grid, 0.05, () => 0.42);
  }

  // Every NPC should have moved along its walkable corridor path
  npcs.forEach((npc, idx) => {
    const movedDist = Math.hypot(
      npc.x - startPositions[idx].x,
      npc.y - startPositions[idx].y
    );
    assert.ok(
      movedDist > 20,
      `Expected roaming developer NPC ${npc.id} to move across the studio`
    );
  });
});
