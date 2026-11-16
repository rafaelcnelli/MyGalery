import React from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  Monitor,
  Navigation,
  ZoomIn,
  ZoomOut,
  Zap,
} from 'lucide-react';
import {
  PlacedAppTerminal,
  RoamingStudioNPCState,
  STUDIO_MAP_COLS,
  STUDIO_MAP_ROWS,
  STUDIO_ROOMS,
  STUDIO_TILE_SIZE,
  STUDIO_WORLD_HEIGHT,
  STUDIO_WORLD_WIDTH,
  StudioRoomDef,
} from '../utils/pixelStudioWorld';
import { ACCENT_HEX_MAP } from './PixelStudioSprites';

interface PixelStudioMiniMapProps {
  playerX: number;
  playerY: number;
  camX: number;
  camY: number;
  viewportWidth: number;
  viewportHeight: number;
  cameraZoom: number;
  onToggleZoom: () => void;
  currentRoomId: string;
  placedApps: PlacedAppTerminal[];
  roamingNPCs: RoamingStudioNPCState[];
  matchingAppIds: Set<string>;
  hasActiveFilter: boolean;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  onWalkToTile: (col: number, row: number) => void;
  onTeleportToRoom: (room: StudioRoomDef) => void;
  onWalkToCentralCRT: () => void;
}

const MINI_SCALE = 5.5;
const MAP_W = STUDIO_MAP_COLS * MINI_SCALE; // 187px
const MAP_H = STUDIO_MAP_ROWS * MINI_SCALE; // 121px

const MINI_WALLS: Array<{ col: number; row: number; w: number; h: number }> = [
  { col: 0, row: 0, w: STUDIO_MAP_COLS, h: 1 },
  { col: 0, row: STUDIO_MAP_ROWS - 1, w: STUDIO_MAP_COLS, h: 1 },
  { col: 0, row: 1, w: 1, h: STUDIO_MAP_ROWS - 2 },
  { col: STUDIO_MAP_COLS - 1, row: 1, w: 1, h: STUDIO_MAP_ROWS - 2 },
  { col: 12, row: 1, w: 1, h: 4 },
  { col: 12, row: 7, w: 1, h: 3 },
  { col: 12, row: 12, w: 1, h: 3 },
  { col: 12, row: 17, w: 1, h: 4 },
  { col: 21, row: 1, w: 1, h: 4 },
  { col: 21, row: 7, w: 1, h: 3 },
  { col: 21, row: 12, w: 1, h: 3 },
  { col: 21, row: 17, w: 1, h: 4 },
  { col: 1, row: 9, w: 4, h: 1 },
  { col: 7, row: 9, w: 5, h: 1 },
  { col: 1, row: 12, w: 4, h: 1 },
  { col: 7, row: 12, w: 5, h: 1 },
  { col: 22, row: 9, w: 5, h: 1 },
  { col: 29, row: 9, w: 4, h: 1 },
  { col: 22, row: 12, w: 5, h: 1 },
  { col: 29, row: 12, w: 4, h: 1 },
];

export const PixelStudioMiniMap: React.FC<PixelStudioMiniMapProps> = ({
  playerX,
  playerY,
  camX,
  camY,
  viewportWidth,
  viewportHeight,
  cameraZoom,
  onToggleZoom,
  currentRoomId,
  placedApps,
  roamingNPCs,
  matchingAppIds,
  hasActiveFilter,
  isCollapsed = false,
  onToggleCollapsed,
  onWalkToTile,
  onTeleportToRoom,
  onWalkToCentralCRT,
}) => {
  const playerMiniX = (playerX / STUDIO_WORLD_WIDTH) * MAP_W;
  const playerMiniY = (playerY / STUDIO_WORLD_HEIGHT) * MAP_H;

  const worldLeft = Math.max(0, camX / cameraZoom);
  const worldTop = Math.max(0, camY / cameraZoom);
  const worldVisW = Math.min(
    STUDIO_WORLD_WIDTH - worldLeft,
    viewportWidth / cameraZoom
  );
  const worldVisH = Math.min(
    STUDIO_WORLD_HEIGHT - worldTop,
    viewportHeight / cameraZoom
  );

  const camMiniLeft = (worldLeft / STUDIO_WORLD_WIDTH) * MAP_W;
  const camMiniTop = (worldTop / STUDIO_WORLD_HEIGHT) * MAP_H;
  const camMiniW = (worldVisW / STUDIO_WORLD_WIDTH) * MAP_W;
  const camMiniH = (worldVisH / STUDIO_WORLD_HEIGHT) * MAP_H;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const col = Math.max(
      1,
      Math.min(STUDIO_MAP_COLS - 2, Math.floor(clickX / MINI_SCALE))
    );
    const row = Math.max(
      1,
      Math.min(STUDIO_MAP_ROWS - 2, Math.floor(clickY / MINI_SCALE))
    );

    // Check if click falls inside one of the 5 rooms -> Fast Teleport to room entrance
    const clickedRoom = STUDIO_ROOMS.find(
      (r) =>
        col >= r.bounds.minCol &&
        col <= r.bounds.maxCol &&
        row >= r.bounds.minRow &&
        row <= r.bounds.maxRow
    );
    if (clickedRoom) {
      onTeleportToRoom(clickedRoom);
    } else {
      onWalkToTile(col, row);
    }
  };

  const currentRoom =
    STUDIO_ROOMS.find((r) => r.id === currentRoomId) || STUDIO_ROOMS[0];

  const centralRoom = STUDIO_ROOMS[0];
  const crtMiniX =
    (centralRoom.crtTile.col + centralRoom.crtWidthTiles / 2) * MINI_SCALE;
  const crtMiniY = (centralRoom.crtTile.row + 0.5) * MINI_SCALE;

  return (
    <aside
      data-testid="pixel-studio-minimap"
      aria-label="Mini-mapa tático do Estúdio Pixel"
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto absolute top-2.5 right-2.5 z-30 rounded-xl bg-slate-950/92 border-2 border-slate-600/90 shadow-[0_10px_28px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden select-none"
    >
      {/* Header Bar */}
      <div className="px-2.5 py-1.5 bg-slate-900/95 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="font-pixel-title text-[8px] text-slate-100 tracking-wider uppercase truncate">
            RADAR [M]
          </span>
          <span
            style={{
              color: currentRoom.accentHex,
              borderColor: `${currentRoom.accentHex}55`,
            }}
            className="px-1.5 py-0.5 rounded bg-slate-950 font-pixel text-[10px] border leading-none truncate max-w-[92px]"
          >
            {currentRoom.shortTitle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleZoom}
            data-testid="minimap-zoom-toggle"
            title={
              cameraZoom > 1
                ? 'Afastar câmera para ver mais do estúdio'
                : 'Aproximar câmera do personagem'
            }
            className="px-1.5 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/40 text-[9px] font-mono font-bold text-indigo-200 flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            {cameraZoom > 1 ? (
              <ZoomOut className="w-2.5 h-2.5" />
            ) : (
              <ZoomIn className="w-2.5 h-2.5" />
            )}
            <span>{Math.round(cameraZoom * 100)}%</span>
          </button>

          <button
            type="button"
            onClick={onToggleCollapsed}
            data-testid="minimap-collapse-toggle"
            aria-label={isCollapsed ? 'Expandir mini-mapa' : 'Recolher mini-mapa'}
            title={isCollapsed ? 'Expandir mini-mapa (M)' : 'Recolher mini-mapa (M)'}
            className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <Maximize2 className="w-3 h-3" />
            ) : (
              <Minimize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-2 flex flex-col gap-1.5">
          {/* Interactive Scaled Radar Canvas (Click any room for Fast Teleport) */}
          <div
            onClick={handleMapClick}
            data-testid="minimap-radar-canvas"
            title="Clique em qualquer sala no radar para Teleporte Rápido instantâneo"
            style={{ width: MAP_W, height: MAP_H }}
            className="relative rounded-md bg-[#111522] border border-slate-700 overflow-hidden cursor-pointer shadow-inner"
          >
            {/* Room Zones */}
            {STUDIO_ROOMS.map((room) => {
              const isCurrent = room.id === currentRoomId;
              const left = room.bounds.minCol * MINI_SCALE;
              const top = room.bounds.minRow * MINI_SCALE;
              const width =
                (room.bounds.maxCol - room.bounds.minCol + 1) * MINI_SCALE;
              const height =
                (room.bounds.maxRow - room.bounds.minRow + 1) * MINI_SCALE;

              return (
                <div
                  key={`mini-room-${room.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTeleportToRoom(room);
                  }}
                  style={{
                    left,
                    top,
                    width,
                    height,
                    borderColor: isCurrent ? room.accentHex : `${room.accentHex}66`,
                    backgroundColor: isCurrent
                      ? `${room.accentHex}38`
                      : `${room.accentHex}1c`,
                  }}
                  title={`Teleporte Rápido: ${room.title}`}
                  className="absolute border transition-colors hover:brightness-125 flex items-center justify-center"
                >
                  <span
                    style={{ color: room.accentHex }}
                    className="font-pixel text-[8px] uppercase tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] px-0.5 bg-slate-950/75 rounded-2xs pointer-events-none"
                  >
                    {room.shortTitle}
                  </span>
                </div>
              );
            })}

            {/* Walls */}
            {MINI_WALLS.map((w, idx) => (
              <div
                key={`mw-${idx}`}
                style={{
                  left: w.col * MINI_SCALE,
                  top: w.row * MINI_SCALE,
                  width: w.w * MINI_SCALE,
                  height: w.h * MINI_SCALE,
                }}
                className="absolute bg-slate-400/45 pointer-events-none"
              />
            ))}

            {/* Placed App Machines Dots (Pulsing when matching active filter) */}
            {placedApps.map((placed) => {
              const isMatch = matchingAppIds.has(placed.app.id);
              const dotHex =
                ACCENT_HEX_MAP[placed.app.accentColor] || '#818cf8';
              return (
                <div
                  key={`mini-app-${placed.app.id}`}
                  style={{
                    left: (placed.col + 0.5) * MINI_SCALE - 2,
                    top: (placed.row + 0.5) * MINI_SCALE - 2,
                    backgroundColor: dotHex,
                    opacity: !hasActiveFilter || isMatch ? 1 : 0.2,
                  }}
                  className={`absolute w-1.5 h-1.5 rounded-2xs pointer-events-none ${
                    hasActiveFilter && isMatch
                      ? 'ring-2 ring-white animate-ping'
                      : ''
                  }`}
                />
              );
            })}

            {/* Roaming Developer NPCs Dots */}
            {roamingNPCs.map((npc) => (
              <div
                key={`mini-npc-${npc.id}`}
                style={{
                  left: (npc.x / STUDIO_WORLD_WIDTH) * MAP_W - 2,
                  top: (npc.y / STUDIO_WORLD_HEIGHT) * MAP_H - 2,
                  backgroundColor: npc.shirtColor,
                }}
                className="absolute w-1 h-1 rounded-full opacity-90 pointer-events-none"
              />
            ))}

            {/* Central Retro OS Terminal Beacon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWalkToCentralCRT();
              }}
              data-testid="minimap-central-crt-beacon"
              title="Terminal Central Retro OS — Clique para caminhar até lá"
              style={{
                left: crtMiniX - 5,
                top: crtMiniY - 5,
              }}
              className="absolute z-20 w-2.5 h-2.5 rounded-xs bg-amber-300 border border-slate-950 shadow-[0_0_8px_#fbbf24] flex items-center justify-center hover:scale-125 transition-transform cursor-pointer"
            >
              <span className="w-1 h-1 bg-slate-950" />
            </button>

            {/* Camera Viewport Frame Box */}
            <div
              style={{
                left: camMiniLeft,
                top: camMiniTop,
                width: camMiniW,
                height: camMiniH,
              }}
              className="absolute z-10 border border-white/60 bg-white/[0.04] pointer-events-none"
            />

            {/* Live Player Position Marker */}
            <div
              data-testid="minimap-player-dot"
              style={{
                left: playerMiniX - 4,
                top: playerMiniY - 4,
              }}
              className="absolute z-30 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 shadow-[0_0_8px_#34d399] pointer-events-none"
            >
              <span className="absolute -inset-1 rounded-full border border-emerald-300/80 animate-ping" />
            </div>
          </div>

          {/* Quick Teleport Bar & Retro OS Action */}
          <div className="flex items-center justify-between gap-1.5 text-[10px]">
            <div className="flex items-center gap-2 font-pixel text-slate-300">
              <span className="inline-flex items-center gap-1 text-cyan-300">
                <Zap className="w-2.5 h-2.5" /> Clique na sala = Teleporte
              </span>
              <span className="text-slate-500 font-mono text-[9px]">
                ({Math.floor(playerX / STUDIO_TILE_SIZE)},
                {Math.floor(playerY / STUDIO_TILE_SIZE)})
              </span>
            </div>

            <button
              type="button"
              onClick={onWalkToCentralCRT}
              data-testid="minimap-goto-retro-os"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 font-pixel text-[10px] text-amber-200 transition-colors cursor-pointer"
              title="Caminhar até o Terminal Central Retro OS"
            >
              <Monitor className="w-2.5 h-2.5 text-amber-300" />
              <span>Ir ao Retro OS</span>
              <Navigation className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
