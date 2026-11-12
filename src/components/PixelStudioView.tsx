import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus, Monitor, ArrowRight, Footprints } from 'lucide-react';
import { WebAppItem } from '../types/launcher';
import { AppLogo } from './AppLogo';
import {
  CharacterDirection,
  PLAYER_SPAWN_POS,
  PlacedAppTerminal,
  STUDIO_MAP_COLS,
  STUDIO_MAP_ROWS,
  STUDIO_ROOMS,
  STUDIO_TILE_SIZE,
  STUDIO_WORLD_HEIGHT,
  STUDIO_WORLD_WIDTH,
  StudioRoomDef,
  TileCoord,
  assignAppsToRoomDesks,
  buildStudioCollisionGrid,
  findNearestWalkableTile,
  findShortestTilePath,
  getRoomAtPosition,
  moveWithCollision,
} from '../utils/pixelStudioWorld';
import {
  IndieDevPlayerSprite,
  PixelAgentSprite,
  PixelCRTMonitorSVG,
  StudioDecorSprite,
  getDeskSurfaceClasses,
} from './PixelStudioSprites';

interface PixelStudioViewProps {
  apps: WebAppItem[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  isInteractionPaused?: boolean;
  onEnterRetroOSWithFilter: (categoryFilter: string) => void;
  onPrimaryAppClick: (app: WebAppItem) => void;
  onOpenNewAppModal: () => void;
}

type PendingArrivalAction =
  | { type: 'app'; app: WebAppItem }
  | { type: 'crt'; roomId: string; categoryFilter: string }
  | null;

const WALL_SEGMENTS: Array<{
  col: number;
  row: number;
  w: number;
  h: number;
}> = [
  // Outer perimeter
  { col: 0, row: 0, w: STUDIO_MAP_COLS, h: 1 },
  { col: 0, row: STUDIO_MAP_ROWS - 1, w: STUDIO_MAP_COLS, h: 1 },
  { col: 0, row: 1, w: 1, h: STUDIO_MAP_ROWS - 2 },
  { col: STUDIO_MAP_COLS - 1, row: 1, w: 1, h: STUDIO_MAP_ROWS - 2 },
  // Left vertical partition (col 12) with doorways at rows 5..6 & 15..16
  { col: 12, row: 1, w: 1, h: 4 },
  { col: 12, row: 7, w: 1, h: 3 },
  { col: 12, row: 12, w: 1, h: 3 },
  { col: 12, row: 17, w: 1, h: 4 },
  // Right vertical partition (col 21) with doorways at rows 5..6 & 15..16
  { col: 21, row: 1, w: 1, h: 4 },
  { col: 21, row: 7, w: 1, h: 3 },
  { col: 21, row: 12, w: 1, h: 3 },
  { col: 21, row: 17, w: 1, h: 4 },
  // West horizontal corridor walls (rows 9 & 12) with doorway at cols 5..6
  { col: 1, row: 9, w: 4, h: 1 },
  { col: 7, row: 9, w: 5, h: 1 },
  { col: 1, row: 12, w: 4, h: 1 },
  { col: 7, row: 12, w: 5, h: 1 },
  // East horizontal corridor walls (rows 9 & 12) with doorway at cols 27..28
  { col: 22, row: 9, w: 5, h: 1 },
  { col: 29, row: 9, w: 4, h: 1 },
  { col: 22, row: 12, w: 5, h: 1 },
  { col: 29, row: 12, w: 4, h: 1 },
];

const DOORWAY_THRESHOLDS: Array<{
  col: number;
  row: number;
  w: number;
  h: number;
}> = [
  { col: 12, row: 5, w: 1, h: 2 },
  { col: 21, row: 5, w: 1, h: 2 },
  { col: 12, row: 15, w: 1, h: 2 },
  { col: 21, row: 15, w: 1, h: 2 },
  { col: 5, row: 9, w: 2, h: 1 },
  { col: 5, row: 12, w: 2, h: 1 },
  { col: 27, row: 9, w: 2, h: 1 },
  { col: 27, row: 12, w: 2, h: 1 },
];

export const PixelStudioView: React.FC<PixelStudioViewProps> = ({
  apps,
  matchingAppIds,
  hasActiveFilter,
  isInteractionPaused = false,
  onEnterRetroOSWithFilter,
  onPrimaryAppClick,
  onOpenNewAppModal,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 680 });
  const [zoomingTargetId, setZoomingTargetId] = useState<string | null>(null);

  // World data derived from current apps
  const placedApps = useMemo(() => assignAppsToRoomDesks(apps), [apps]);
  const collisionGrid = useMemo(
    () => buildStudioCollisionGrid(placedApps),
    [placedApps]
  );

  // Player state (refs for 60fps loop + throttled React render state)
  const playerPosRef = useRef({ ...PLAYER_SPAWN_POS });
  const directionRef = useRef<CharacterDirection>('down');
  const walkFrameRef = useRef<0 | 1>(0);
  const stepDistRef = useRef(0);
  const pathQueueRef = useRef<TileCoord[]>([]);
  const pendingActionRef = useRef<PendingArrivalAction>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  const [playerRender, setPlayerRender] = useState({
    x: PLAYER_SPAWN_POS.x,
    y: PLAYER_SPAWN_POS.y,
    direction: 'down' as CharacterDirection,
    isMoving: false,
    walkFrame: 0 as 0 | 1,
  });
  const [activePathPreview, setActivePathPreview] = useState<TileCoord[]>([]);
  const [targetAppId, setTargetAppId] = useState<string | null>(null);

  // Measure viewport container dynamically for responsive camera follow
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateSize = () => {
      setViewportSize({
        width: el.clientWidth || 1200,
        height: el.clientHeight || 680,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const triggerZoomIntoRetroOS = useCallback(
    (stationId: string, categoryFilter: string) => {
      setZoomingTargetId(stationId);
      window.setTimeout(() => {
        onEnterRetroOSWithFilter(categoryFilter);
      }, 280);
    },
    [onEnterRetroOSWithFilter]
  );

  // Find nearest interactable terminal / CRT within proximity
  const playerTile = useMemo(
    () => ({
      col: playerRender.x / STUDIO_TILE_SIZE,
      row: playerRender.y / STUDIO_TILE_SIZE,
    }),
    [playerRender.x, playerRender.y]
  );

  const nearbyApp = useMemo(() => {
    let best: PlacedAppTerminal | null = null;
    let bestDist = 1.65;
    for (const placed of placedApps) {
      const cx = placed.col + 0.5;
      const cy = placed.row + 0.5;
      const dist = Math.hypot(playerTile.col - cx, playerTile.row - cy);
      if (dist <= bestDist) {
        bestDist = dist;
        best = placed;
      }
    }
    return best;
  }, [placedApps, playerTile]);

  const nearbyCRT = useMemo(() => {
    let best: StudioRoomDef | null = null;
    let bestDist = 1.85;
    for (const room of STUDIO_ROOMS) {
      const cx = room.crtTile.col + room.crtWidthTiles / 2;
      const cy = room.crtTile.row + 0.5;
      const dist = Math.hypot(playerTile.col - cx, playerTile.row - cy);
      if (dist <= bestDist) {
        bestDist = dist;
        best = room;
      }
    }
    return best;
  }, [playerTile]);

  const currentRoom = useMemo(
    () => getRoomAtPosition(playerRender.x, playerRender.y),
    [playerRender.x, playerRender.y]
  );

  const appsInCurrentRoom = useMemo(() => {
    if (currentRoom.id === 'central-lobby') return apps.length;
    return placedApps.filter((p) => p.roomId === currentRoom.id).length;
  }, [apps.length, currentRoom.id, placedApps]);

  // Execute arrival action when character reaches clicked App or CRT
  const handleArrivalAction = useCallback(
    (action: PendingArrivalAction) => {
      if (!action) return;
      setTargetAppId(null);
      if (action.type === 'app') {
        onPrimaryAppClick(action.app);
      } else if (action.type === 'crt') {
        triggerZoomIntoRetroOS(action.roomId, action.categoryFilter);
      }
    },
    [onPrimaryAppClick, triggerZoomIntoRetroOS]
  );

  // Trigger interaction via Space/Enter/E or proximity CTA
  const handleActivateNearby = useCallback(() => {
    if (nearbyApp) {
      onPrimaryAppClick(nearbyApp.app);
      return;
    }
    if (nearbyCRT) {
      triggerZoomIntoRetroOS(nearbyCRT.id, nearbyCRT.categoryFilter);
    }
  }, [nearbyApp, nearbyCRT, onPrimaryAppClick, triggerZoomIntoRetroOS]);

  // Keyboard Listeners (WASD / ArrowKeys / Shift / Space / Enter / E)
  useEffect(() => {
    const isInputFocused = (target: EventTarget | null) => {
      const el = (target as HTMLElement) || document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isInteractionPaused || zoomingTargetId || isInputFocused(e.target)) {
        pressedKeysRef.current.clear();
        return;
      }

      const key = e.key.toLowerCase();
      if (
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(
          key
        )
      ) {
        if (key.startsWith('arrow')) e.preventDefault();
        pressedKeysRef.current.add(key);

        // Manual directional input cancels auto-walk pathfinding
        if (key !== 'shift' && pathQueueRef.current.length > 0) {
          pathQueueRef.current = [];
          pendingActionRef.current = null;
          setActivePathPreview([]);
          setTargetAppId(null);
        }
      } else if (key === ' ' || key === 'enter' || key === 'e') {
        if (nearbyApp || nearbyCRT) {
          e.preventDefault();
          handleActivateNearby();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.key.toLowerCase());
    };

    const onBlur = () => {
      pressedKeysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    handleActivateNearby,
    isInteractionPaused,
    nearbyApp,
    nearbyCRT,
    zoomingTargetId,
  ]);

  // 60fps Animation & Movement Loop (Keyboard + BFS Auto-Walk)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!isInteractionPaused && !zoomingTargetId) {
        const keys = pressedKeysRef.current;
        let vx = 0;
        let vy = 0;

        if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
        if (keys.has('d') || keys.has('arrowright')) vx += 1;
        if (keys.has('w') || keys.has('arrowup')) vy -= 1;
        if (keys.has('s') || keys.has('arrowdown')) vy += 1;

        const speed = keys.has('shift') ? 390 : 275; // px per second
        let movedThisFrame = false;

        if (vx !== 0 || vy !== 0) {
          const mag = Math.hypot(vx, vy);
          const dx = (vx / mag) * speed * dt;
          const dy = (vy / mag) * speed * dt;

          if (Math.abs(vx) >= Math.abs(vy)) {
            directionRef.current = vx < 0 ? 'left' : 'right';
          } else {
            directionRef.current = vy < 0 ? 'up' : 'down';
          }

          const next = moveWithCollision(
            collisionGrid,
            playerPosRef.current.x,
            playerPosRef.current.y,
            dx,
            dy
          );

          const distMoved = Math.hypot(
            next.x - playerPosRef.current.x,
            next.y - playerPosRef.current.y
          );
          if (distMoved > 0.1) {
            playerPosRef.current = next;
            stepDistRef.current += distMoved;
            if (stepDistRef.current >= 16) {
              stepDistRef.current = 0;
              walkFrameRef.current = walkFrameRef.current === 0 ? 1 : 0;
            }
            movedThisFrame = true;
          }
        } else if (pathQueueRef.current.length > 0) {
          // Follow BFS waypoints smoothly
          const waypoint = pathQueueRef.current[0];
          const targetX = (waypoint.col + 0.5) * STUDIO_TILE_SIZE;
          const targetY = (waypoint.row + 0.5) * STUDIO_TILE_SIZE;

          const diffX = targetX - playerPosRef.current.x;
          const diffY = targetY - playerPosRef.current.y;
          const dist = Math.hypot(diffX, diffY);
          const step = 300 * dt;

          if (Math.abs(diffX) >= Math.abs(diffY)) {
            if (Math.abs(diffX) > 1) {
              directionRef.current = diffX < 0 ? 'left' : 'right';
            }
          } else if (Math.abs(diffY) > 1) {
            directionRef.current = diffY < 0 ? 'up' : 'down';
          }

          if (dist <= step) {
            playerPosRef.current = { x: targetX, y: targetY };
            pathQueueRef.current.shift();
            setActivePathPreview([...pathQueueRef.current]);
            movedThisFrame = true;

            if (pathQueueRef.current.length === 0 && pendingActionRef.current) {
              const actionToRun = pendingActionRef.current;
              pendingActionRef.current = null;
              // Face upward toward desk/CRT when arriving
              directionRef.current = 'up';
              handleArrivalAction(actionToRun);
            }
          } else {
            playerPosRef.current = {
              x: playerPosRef.current.x + (diffX / dist) * step,
              y: playerPosRef.current.y + (diffY / dist) * step,
            };
            stepDistRef.current += step;
            if (stepDistRef.current >= 16) {
              stepDistRef.current = 0;
              walkFrameRef.current = walkFrameRef.current === 0 ? 1 : 0;
            }
            movedThisFrame = true;
          }
        }

        setPlayerRender((prev) => {
          const isMovingNow = movedThisFrame;
          if (
            !movedThisFrame &&
            prev.isMoving === isMovingNow &&
            prev.direction === directionRef.current
          ) {
            return prev;
          }
          return {
            x: playerPosRef.current.x,
            y: playerPosRef.current.y,
            direction: directionRef.current,
            isMoving: isMovingNow,
            walkFrame: walkFrameRef.current,
          };
        });
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    collisionGrid,
    handleArrivalAction,
    isInteractionPaused,
    zoomingTargetId,
  ]);

  // Walk character to a specific tile coordinate
  const walkToTile = useCallback(
    (
      goalCol: number,
      goalRow: number,
      pendingAction: PendingArrivalAction = null,
      highlightAppId: string | null = null
    ) => {
      const startCol = Math.floor(playerPosRef.current.x / STUDIO_TILE_SIZE);
      const startRow = Math.floor(playerPosRef.current.y / STUDIO_TILE_SIZE);
      const nearest = findNearestWalkableTile(collisionGrid, goalCol, goalRow);
      if (!nearest) return;

      if (startCol === nearest.col && startRow === nearest.row) {
        if (pendingAction) {
          directionRef.current = 'up';
          handleArrivalAction(pendingAction);
        }
        return;
      }

      const path = findShortestTilePath(
        collisionGrid,
        startCol,
        startRow,
        nearest.col,
        nearest.row
      );

      if (path.length > 0) {
        pathQueueRef.current = path;
        pendingActionRef.current = pendingAction;
        setActivePathPreview(path);
        setTargetAppId(highlightAppId);
      } else if (pendingAction) {
        handleArrivalAction(pendingAction);
      }
    },
    [collisionGrid, handleArrivalAction]
  );

  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const worldX = e.clientX - rect.left;
    const worldY = e.clientY - rect.top;
    const col = Math.floor(worldX / STUDIO_TILE_SIZE);
    const row = Math.floor(worldY / STUDIO_TILE_SIZE);
    walkToTile(col, row, null, null);
  };

  const handleAppTerminalClick = (
    e: React.MouseEvent,
    placed: PlacedAppTerminal
  ) => {
    e.stopPropagation();
    const cx = placed.col + 0.5;
    const cy = placed.row + 0.5;
    const dist = Math.hypot(playerTile.col - cx, playerTile.row - cy);
    if (dist <= 1.65) {
      onPrimaryAppClick(placed.app);
      return;
    }
    walkToTile(
      placed.interactTile.col,
      placed.interactTile.row,
      { type: 'app', app: placed.app },
      placed.app.id
    );
  };

  const handleCRTClick = (e: React.MouseEvent, room: StudioRoomDef) => {
    e.stopPropagation();
    const cx = room.crtTile.col + room.crtWidthTiles / 2;
    const cy = room.crtTile.row + 0.5;
    const dist = Math.hypot(playerTile.col - cx, playerTile.row - cy);
    if (dist <= 1.85) {
      triggerZoomIntoRetroOS(room.id, room.categoryFilter);
      return;
    }
    walkToTile(
      room.crtInteractTile.col,
      room.crtInteractTile.row,
      { type: 'crt', roomId: room.id, categoryFilter: room.categoryFilter },
      null
    );
  };

  const handleRoomQuickNav = (room: StudioRoomDef) => {
    walkToTile(room.centerTile.col, room.centerTile.row, null, null);
  };

  // Compute smooth clamped 2D camera offset
  const camX =
    viewportSize.width >= STUDIO_WORLD_WIDTH
      ? -Math.round((viewportSize.width - STUDIO_WORLD_WIDTH) / 2)
      : Math.max(
          0,
          Math.min(
            STUDIO_WORLD_WIDTH - viewportSize.width,
            Math.round(playerRender.x - viewportSize.width / 2)
          )
        );

  const camY =
    viewportSize.height >= STUDIO_WORLD_HEIGHT
      ? -Math.round((viewportSize.height - STUDIO_WORLD_HEIGHT) / 2)
      : Math.max(
          0,
          Math.min(
            STUDIO_WORLD_HEIGHT - viewportSize.height,
            Math.round(playerRender.y - viewportSize.height / 2)
          )
        );

  return (
    <main
      data-testid="pixel-studio-view"
      aria-label="Estúdio Indie Interativo em Pixel Art"
      className="relative z-10 flex-1 w-full h-full min-h-0 overflow-hidden px-2 sm:px-4 pb-2 pt-1 flex flex-col gap-1.5 select-none"
    >
      {/* Top Studio HUD: Current Room Status (unboxed text) + Room Quick-Walk Switcher */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Clean Unboxed Room & Count Metadata */}
        <div className="flex items-center gap-2 min-w-0">
          <Footprints className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span
            className="font-pixel-title text-[9px] sm:text-[10px] truncate"
            style={{ color: currentRoom.accentHex }}
          >
            {currentRoom.title}
          </span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="font-mono tabular-nums text-xs text-slate-300 whitespace-nowrap">
            {appsInCurrentRoom}{' '}
            {appsInCurrentRoom === 1 ? 'app' : 'apps'}
          </span>
        </div>

        {/* Interactive Room Quick-Nav Buttons (Character walks there automatically) */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full">
          <div
            role="group"
            aria-label="Ir para sala do estúdio"
            className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-white/10"
          >
            {STUDIO_ROOMS.map((room) => {
              const isHere = currentRoom.id === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleRoomQuickNav(room)}
                  data-testid={`studio-nav-${room.id}`}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isHere
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {room.shortTitle}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenNewAppModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo App</span>
          </button>
        </div>
      </div>

      {/* Interactive 2D Pixel World Viewport */}
      <div
        ref={viewportRef}
        className={`relative flex-1 w-full max-w-[1600px] mx-auto min-h-0 rounded-2xl bg-slate-950 border-2 border-slate-700/90 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 ease-out ${
          zoomingTargetId ? 'scale-[1.45] opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* World Space Layer (1360x880 translated smoothly via GPU) */}
        <div
          onClick={handleFloorClick}
          data-testid="pixel-studio-world"
          style={{
            width: STUDIO_WORLD_WIDTH,
            height: STUDIO_WORLD_HEIGHT,
            transform: `translate3d(${-camX}px, ${-camY}px, 0)`,
          }}
          className="relative cursor-crosshair will-change-transform"
        >
          {/* 1. Base Connecting Lobby & Corridor Floor */}
          <div
            className="absolute inset-0 studio-floor-lobby"
            aria-hidden="true"
          />

          {/* 2. Custom Themed Room Floor Zones */}
          {STUDIO_ROOMS.filter((r) => r.id !== 'central-lobby').map((room) => (
            <div
              key={room.id}
              data-testid={`studio-room-${room.id}`}
              style={{
                left: room.bounds.minCol * STUDIO_TILE_SIZE,
                top: room.bounds.minRow * STUDIO_TILE_SIZE,
                width:
                  (room.bounds.maxCol - room.bounds.minCol + 1) *
                  STUDIO_TILE_SIZE,
                height:
                  (room.bounds.maxRow - room.bounds.minRow + 1) *
                  STUDIO_TILE_SIZE,
                borderColor: room.borderHex,
              }}
              className={`absolute ${room.floorClass} border pointer-events-none`}
            >
              {/* Subtle Floor Room Sign Etching */}
              <div
                className="absolute top-1.5 left-1/2 -translate-x-1/2 font-pixel text-xs tracking-wider opacity-85 whitespace-nowrap px-2 py-0.5 bg-slate-950/65 rounded border border-white/10"
                style={{ color: room.accentHex }}
              >
                {room.title}
              </div>
            </div>
          ))}

          {/* Central Lobby Indigo Rug */}
          <div
            style={{
              left: 15 * STUDIO_TILE_SIZE,
              top: 8 * STUDIO_TILE_SIZE,
              width: 4 * STUDIO_TILE_SIZE,
              height: 4 * STUDIO_TILE_SIZE,
            }}
            className="absolute bg-indigo-950/70 border-2 border-indigo-400/35 rounded-md pointer-events-none"
          />

          {/* 3. Open Doorway Threshold Strips */}
          {DOORWAY_THRESHOLDS.map((door, idx) => (
            <div
              key={`door-${idx}`}
              style={{
                left: door.col * STUDIO_TILE_SIZE,
                top: door.row * STUDIO_TILE_SIZE,
                width: door.w * STUDIO_TILE_SIZE,
                height: door.h * STUDIO_TILE_SIZE,
              }}
              className="absolute bg-amber-400/10 border border-amber-300/25 pointer-events-none flex items-center justify-center"
            >
              <span className="w-1.5 h-1.5 bg-amber-300/40" />
            </div>
          ))}

          {/* 4. Solid Pixel Brick Walls */}
          {WALL_SEGMENTS.map((wall, idx) => (
            <div
              key={`wall-${idx}`}
              style={{
                left: wall.col * STUDIO_TILE_SIZE,
                top: wall.row * STUDIO_TILE_SIZE,
                width: wall.w * STUDIO_TILE_SIZE,
                height: wall.h * STUDIO_TILE_SIZE,
              }}
              className="absolute bg-slate-800 border-2 border-slate-600/80 shadow-[inset_0_2px_0_rgba(255,255,255,0.12),inset_0_-3px_0_rgba(0,0,0,0.6)] pointer-events-none"
            />
          ))}

          {/* 5. Active Click-to-Walk Path Breadcrumbs */}
          {activePathPreview.map((step, idx) => {
            const isLast = idx === activePathPreview.length - 1;
            return (
              <div
                key={`step-${step.col}-${step.row}-${idx}`}
                style={{
                  left: step.col * STUDIO_TILE_SIZE,
                  top: step.row * STUDIO_TILE_SIZE,
                  width: STUDIO_TILE_SIZE,
                  height: STUDIO_TILE_SIZE,
                }}
                className="absolute pointer-events-none flex items-center justify-center z-10"
              >
                {isLast ? (
                  <span className="w-4 h-4 border-2 border-amber-300 bg-amber-400/25 animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 bg-amber-300/55" />
                )}
              </div>
            );
          })}

          {/* 6. Custom Themed Room Furniture & Resident NPCs */}
          {STUDIO_ROOMS.map((room) => (
            <React.Fragment key={`furn-${room.id}`}>
              {room.decorProps.map((prop) => (
                <div
                  key={prop.id}
                  style={{
                    left: prop.col * STUDIO_TILE_SIZE,
                    top: prop.row * STUDIO_TILE_SIZE,
                    width: (prop.widthTiles || 1) * STUDIO_TILE_SIZE,
                    height: STUDIO_TILE_SIZE,
                  }}
                  title={prop.label}
                  className="absolute z-10 pointer-events-none"
                >
                  <StudioDecorSprite prop={prop} />
                </div>
              ))}

              {/* Resident Room NPC */}
              <div
                style={{
                  left: room.npc.col * STUDIO_TILE_SIZE,
                  top: room.npc.row * STUDIO_TILE_SIZE,
                  width: STUDIO_TILE_SIZE,
                  height: STUDIO_TILE_SIZE,
                }}
                title={`${room.npc.name} · ${room.npc.role}`}
                className="absolute z-10 pointer-events-none flex items-center justify-center"
              >
                <div className="animate-pixel-bob">
                  <PixelAgentSprite
                    shirtColor={room.npc.shirtColor}
                    hairColor={room.npc.hairColor}
                    className="w-8 h-8"
                  />
                </div>
              </div>

              {/* Interactive Room CRT / Master CRT Monitor */}
              <button
                type="button"
                onClick={(e) => handleCRTClick(e, room)}
                data-testid={`studio-crt-${room.id}`}
                title={`Ir até o Monitor CRT (${room.shortTitle}) para abrir o Retro OS`}
                style={{
                  left: room.crtTile.col * STUDIO_TILE_SIZE,
                  top: room.crtTile.row * STUDIO_TILE_SIZE,
                  width: room.crtWidthTiles * STUDIO_TILE_SIZE,
                  height: STUDIO_TILE_SIZE,
                }}
                className={`absolute z-20 flex items-center justify-center rounded-md transition-transform hover:scale-105 cursor-pointer ${
                  nearbyCRT?.id === room.id
                    ? 'bg-amber-400/20 ring-2 ring-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-900/75 border border-amber-300/40'
                }`}
              >
                <PixelCRTMonitorSVG
                  className={
                    room.id === 'central-lobby' ? 'w-11 h-11' : 'w-8 h-8'
                  }
                />
                <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-1 bg-slate-950/90 text-[10px] font-pixel text-amber-200 whitespace-nowrap border border-amber-400/40 pointer-events-none">
                  {room.id === 'central-lobby' ? 'RETRO OS (40)' : 'CRT'}
                </span>
              </button>
            </React.Fragment>
          ))}

          {/* 7. Dynamic Interactive App Terminals Inside Themed Rooms */}
          {placedApps.map((placed) => {
            const isNearby = nearbyApp?.app.id === placed.app.id;
            const isTarget = targetAppId === placed.app.id;
            const isMatch = !hasActiveFilter || matchingAppIds.has(placed.app.id);

            return (
              <button
                key={placed.app.id}
                type="button"
                onClick={(e) => handleAppTerminalClick(e, placed)}
                data-testid={`studio-app-${placed.app.id}`}
                title={`${placed.app.name} (${placed.app.category}) — Clique para ir até o app`}
                style={{
                  left: placed.col * STUDIO_TILE_SIZE,
                  top: placed.row * STUDIO_TILE_SIZE,
                  width: STUDIO_TILE_SIZE,
                  height: STUDIO_TILE_SIZE,
                }}
                className={`group absolute z-20 rounded-md flex items-center justify-center transition-all cursor-pointer ${getDeskSurfaceClasses(
                  placed.styleVariant,
                  isNearby,
                  isTarget
                )} ${
                  isMatch
                    ? 'opacity-100 hover:scale-110'
                    : 'opacity-30 grayscale-[40%] hover:opacity-80'
                }`}
              >
                <AppLogo
                  name={placed.app.name}
                  url={placed.app.url}
                  accentColor={placed.app.accentColor}
                  customLogoUrl={placed.app.customLogoUrl}
                  size="xs"
                />

                {/* App Name Plate directly beneath terminal */}
                <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 max-w-[74px] truncate px-1 bg-slate-950/95 text-[10px] font-pixel text-slate-100 border border-white/15 pointer-events-none">
                  {placed.app.name}
                </span>

                {/* Active Proximity / Walking Target Indicator */}
                {(isNearby || isTarget) && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-1 bg-amber-400 text-slate-950 font-pixel text-[9px] font-bold whitespace-nowrap pointer-events-none shadow">
                    {isNearby ? 'ABRIR' : 'INDO...'}
                  </span>
                )}
              </button>
            );
          })}

          {/* 8. Controllable Indie Dev Player Character */}
          <div
            data-testid="pixel-player-character"
            style={{
              left: playerRender.x,
              top: playerRender.y,
              transform: 'translate(-50%, -62%)',
            }}
            className="absolute z-30 pointer-events-none flex flex-col items-center"
          >
            <IndieDevPlayerSprite
              direction={playerRender.direction}
              isMoving={playerRender.isMoving}
              walkFrame={playerRender.walkFrame}
            />
          </div>
        </div>

        {/* Bottom Floating Proximity Interaction Prompt / Controls Legend */}
        <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[94%]">
          {nearbyApp ? (
            <button
              type="button"
              onClick={() => onPrimaryAppClick(nearbyApp.app)}
              data-testid="studio-proximity-open-app"
              className="pointer-events-auto min-h-[44px] px-4 py-2 rounded-xl bg-slate-950/95 hover:bg-indigo-950 border-2 border-amber-400 text-white shadow-2xl flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <AppLogo
                name={nearbyApp.app.name}
                url={nearbyApp.app.url}
                accentColor={nearbyApp.app.accentColor}
                customLogoUrl={nearbyApp.app.customLogoUrl}
                size="xs"
              />
              <span className="font-pixel text-sm sm:text-base text-amber-200 truncate max-w-[180px] sm:max-w-xs">
                {nearbyApp.app.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-pixel-title text-[9px] font-bold">
                <span>ABRIR</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ) : nearbyCRT ? (
            <button
              type="button"
              onClick={() =>
                triggerZoomIntoRetroOS(nearbyCRT.id, nearbyCRT.categoryFilter)
              }
              data-testid="studio-proximity-open-crt"
              className="pointer-events-auto min-h-[44px] px-4 py-2 rounded-xl bg-slate-950/95 hover:bg-emerald-950 border-2 border-emerald-400 text-white shadow-2xl flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <Monitor className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-pixel text-sm sm:text-base text-emerald-200 truncate">
                Retro OS ({nearbyCRT.shortTitle})
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-400 text-slate-950 font-pixel-title text-[9px] font-bold">
                <span>ENTRAR</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-white/10 text-xs text-slate-300 font-pixel whitespace-nowrap truncate shadow-lg">
              WASD / Setas ou clique no chão, sala ou app para caminhar
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
