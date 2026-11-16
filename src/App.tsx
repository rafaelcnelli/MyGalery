import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  WebAppItem,
  ViewMode,
  WallpaperTheme,
  GridDensity,
  AppCategory,
  LauncherState,
  INITIAL_DEMO_APPS,
} from './types/launcher';
import {
  getMatchingAppIds,
  saveAppWithAutoSwap,
  swapSlotPositions,
  sanitizeLauncherPayload,
  loadAndRecoverStateFromLocalStorage,
  mergeAndRecoverApps,
} from './utils/launcherLogic';
import {
  subscribeToFirebaseAuth,
  loginWithGoogleFirebase,
  logoutFirebase,
  loadLauncherFromFirestore,
  saveLauncherToFirestore,
  subscribeToFirestoreWorkspace,
  deleteAppFromFirestore,
  ensureOrUpdateWorkspaceDoc,
  saveAppItemToFirestore,
  seedAppsToFirestore,
  syncSlotSwapToFirestore,
  testFirestoreConnection,
} from './lib/firebase';
import type { User } from 'firebase/auth';
import { TopBar } from './components/TopBar';
import { DesktopGrid } from './components/DesktopGrid';
import { SphereView } from './components/SphereView';
import { PixelStudioView } from './components/PixelStudioView';
import { RetroOSView } from './components/RetroOSView';
import { AppFormModal } from './components/AppFormModal';
import { AppSpotlightModal } from './components/AppSpotlightModal';
import { LivePreviewModal } from './components/LivePreviewModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AppContextMenu, ContextMenuState } from './components/AppContextMenu';
import { Sparkles, ArrowRightLeft } from 'lucide-react';

const STORAGE_KEY = 'my_web_creations_hub_v2';
const CLOUD_ENDPOINT_KEY = 'my_web_creations_cloud_endpoint';

const MODE_ONBOARDING_HINTS: Record<ViewMode, string> = {
  grid: '[Clique] Detalhes • [Duplo Clique] Abrir • [Segurar 300ms] Organizar • [⌘K] Buscar',
  sphere:
    '[Arrastar] Orbitar • [Espaço / Home] Centralizar • [⌘K] Atração Magnética',
  'pixel-studio':
    '[WASD/Clique] Mover • [Shift] Correr • [Espaço] Interagir • [M] Mapa',
  'retro-os':
    '[Clique] Propriedades • [Duplo Clique] Navegador CRT • [⚡ Modo Moderno] Transferir',
};

const loadInitialState = (): LauncherState => {
  return loadAndRecoverStateFromLocalStorage(STORAGE_KEY, INITIAL_DEMO_APPS);
};

export function App() {
  const [state, setState] = useState<LauncherState>(loadInitialState);
  const stateRef = useRef<LauncherState>(state);
  stateRef.current = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    AppCategory | 'Todas'
  >('Todas');
  const [retroRoomFilter, setRetroRoomFilter] = useState<string | undefined>(
    undefined
  );

  // UI & Modal states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTopBarMinimized, setIsTopBarMinimized] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<WebAppItem | null>(null);
  const [targetSlotForNew, setTargetSlotForNew] = useState<number | null>(null);
  const [spotlightApp, setSpotlightApp] = useState<WebAppItem | null>(null);
  const [previewApp, setPreviewApp] = useState<WebAppItem | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Notifications / Toasts
  const [swapToast, setSwapToast] = useState<string | null>(null);
  const [onboardingToast, setOnboardingToast] = useState<string | null>(null);
  const seenModesRef = useRef<Set<ViewMode>>(new Set());

  // Cloud & Firebase Sync state
  const [cloudEndpoint, setCloudEndpoint] = useState<string>(
    () =>
      localStorage.getItem(CLOUD_ENDPOINT_KEY) || state.cloudRestUrl || ''
  );
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseSyncing, setFirebaseSyncing] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  // Validate connection to Firestore on boot
  useEffect(() => {
    void testFirestoreConnection();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  // Load from optional Cloud REST URL on startup if configured
  useEffect(() => {
    if (!cloudEndpoint) return;
    let isCancelled = false;
    void (async () => {
      try {
        const res = await fetch(cloudEndpoint, { method: 'GET' });
        if (!res.ok || isCancelled) return;
        const json = await res.json();
        const remoteSanitized = sanitizeLauncherPayload(json);
        if (remoteSanitized && remoteSanitized.apps.length > 0 && !isCancelled) {
          setState((prev) => {
            const { apps: merged } = mergeAndRecoverApps(
              prev.apps,
              remoteSanitized.apps
            );
            return {
              ...prev,
              hubTitle:
                prev.hubTitle === 'My Web Creations Hub' &&
                remoteSanitized.hubTitle
                  ? remoteSanitized.hubTitle
                  : prev.hubTitle,
              apps: merged,
            };
          });
          setLastSyncedAt(Date.now());
        }
      } catch {
        // Ignore REST network error
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [cloudEndpoint]);

  // Contextual Onboarding Toast (first time entering each mode in session, 4 seconds)
  useEffect(() => {
    const mode = state.viewMode;
    if (!seenModesRef.current.has(mode)) {
      seenModesRef.current.add(mode);
      setOnboardingToast(MODE_ONBOARDING_HINTS[mode]);
      const t = window.setTimeout(() => {
        setOnboardingToast(null);
      }, 4000);
      return () => window.clearTimeout(t);
    }
  }, [state.viewMode]);

  // Subscribe to Firebase Auth & Real-Time Workspace Sync
  useEffect(() => {
    let unsubscribeWorkspace: (() => void) | null = null;
    let isCancelled = false;

    const unsubscribeAuth = subscribeToFirebaseAuth(async (user) => {
      setFirebaseUser(user);
      if (unsubscribeWorkspace) {
        unsubscribeWorkspace();
        unsubscribeWorkspace = null;
      }

      if (!user) {
        setFirebaseSyncing(false);
        return;
      }

      setFirebaseSyncing(true);
      try {
        // 1. Ensure parent workspace document exists if missing (without overwriting remote settings)
        await ensureOrUpdateWorkspaceDoc(
          user.uid,
          {
            hubTitle: stateRef.current.hubTitle,
            theme: stateRef.current.wallpaperTheme || 'aurora',
            clickBehavior: stateRef.current.clickBehavior || 'preview',
            viewMode: stateRef.current.viewMode,
          },
          true
        );

        if (isCancelled) return;

        // 2. Load existing workspace apps from Firestore
        const remoteState = await loadLauncherFromFirestore(user);
        if (isCancelled) return;

        if (remoteState && remoteState.apps.length > 0) {
          const currentLocalApps = stateRef.current.apps;
          const {
            apps: mergedApps,
            localOnlyCustomApps,
            collidingDemoIdsToRemove,
          } = mergeAndRecoverApps(currentLocalApps, remoteState.apps);

          setState((prev) => {
            const localExtMap = new Map(
              prev.apps.map((a) => [a.id, a.openExternalOnly])
            );
            return {
              ...prev,
              hubTitle: remoteState.hubTitle || prev.hubTitle,
              theme: remoteState.theme || prev.theme,
              wallpaperTheme: remoteState.wallpaperTheme || prev.wallpaperTheme,
              apps: mergedApps.map((a) => ({
                ...a,
                openExternalOnly:
                  a.openExternalOnly ?? localExtMap.get(a.id) ?? false,
              })),
            };
          });

          // Remove any accidental demo-app-* seeds that collided with the user's custom app slots
          for (const demoId of collidingDemoIdsToRemove) {
            if (isCancelled) break;
            await deleteAppFromFirestore(user, demoId);
          }

          // Sync any custom apps that existed locally (or in legacy localStorage) up to Firestore
          if (localOnlyCustomApps.length > 0 && !isCancelled) {
            await seedAppsToFirestore(user.uid, localOnlyCustomApps);
          }
        } else {
          // Seed initial local apps only when user's remote workspace is empty
          await saveLauncherToFirestore(user, stateRef.current);
        }

        if (isCancelled) return;
        setLastSyncedAt(Date.now());
        setFirebaseError(null);

        // 3. Subscribe to real-time updates on user's apps subcollection
        unsubscribeWorkspace = subscribeToFirestoreWorkspace(
          user,
          (remoteApps) => {
            if (isCancelled || remoteApps.length === 0) return;
            setState((prev) => {
              const localExtMap = new Map(
                prev.apps.map((a) => [a.id, a.openExternalOnly])
              );
              const { apps: merged } = mergeAndRecoverApps(
                prev.apps,
                remoteApps
              );
              return {
                ...prev,
                apps: merged.map((a) => ({
                  ...a,
                  openExternalOnly:
                    a.openExternalOnly ?? localExtMap.get(a.id) ?? false,
                })),
              };
            });
            setLastSyncedAt(Date.now());
          },
          (errMsg) => setFirebaseError(errMsg)
        );
      } catch (err) {
        if (!isCancelled) {
          setFirebaseError(
            err instanceof Error ? err.message : 'Erro ao sincronizar Firebase'
          );
        }
      } finally {
        if (!isCancelled) {
          setFirebaseSyncing(false);
        }
      }
    });

    return () => {
      isCancelled = true;
      unsubscribeAuth();
      if (unsubscribeWorkspace) unsubscribeWorkspace();
    };
  }, []);

  const showSwapToast = useCallback((msg: string) => {
    setSwapToast(msg);
    window.setTimeout(() => {
      setSwapToast(null);
    }, 3200);
  }, []);

  const matchingAppIds = useMemo(
    () => getMatchingAppIds(state.apps, searchQuery, selectedCategory),
    [state.apps, searchQuery, selectedCategory]
  );

  const hasActiveFilter =
    searchQuery.trim() !== '' || selectedCategory !== 'Todas';

  const handleClearFilter = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('Todas');
  }, []);

  // Universal Launch Handlers
  const handleOpenExternal = useCallback((app: WebAppItem) => {
    const a = document.createElement('a');
    a.href = app.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleOpenInternal = useCallback(
    (app: WebAppItem) => {
      if (app.openExternalOnly) {
        handleOpenExternal(app);
      } else {
        setPreviewApp(app);
      }
    },
    [handleOpenExternal]
  );

  const handlePrimaryAppClick = useCallback(
    (app: WebAppItem, e?: React.MouseEvent) => {
      if (e && (e.metaKey || e.ctrlKey)) {
        handleOpenExternal(app);
        return;
      }
      if (state.directLaunchMode) {
        handleOpenInternal(app);
        return;
      }
      setSpotlightApp(app);
    },
    [handleOpenExternal, handleOpenInternal, state.directLaunchMode]
  );

  const handleDoubleClickApp = useCallback(
    (app: WebAppItem) => {
      setSpotlightApp(null);
      handleOpenInternal(app);
    },
    [handleOpenInternal]
  );

  const handleContextMenuApp = useCallback(
    (app: WebAppItem, e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
        app,
        x: e.clientX,
        y: e.clientY,
      });
    },
    []
  );

  const handleToggleExternalOnly = useCallback((targetApp: WebAppItem) => {
    const nextFlag = !targetApp.openExternalOnly;
    setState((prev) => ({
      ...prev,
      apps: prev.apps.map((a) =>
        a.id === targetApp.id ? { ...a, openExternalOnly: nextFlag } : a
      ),
    }));
    setSpotlightApp((prev) =>
      prev && prev.id === targetApp.id
        ? { ...prev, openExternalOnly: nextFlag }
        : prev
    );
    setPreviewApp((prev) =>
      prev && prev.id === targetApp.id
        ? { ...prev, openExternalOnly: nextFlag }
        : prev
    );
  }, []);

  // CRUD & Auto-Swap Handlers with Targeted Firestore Writes
  const handleSaveApp = useCallback(
    (data: Omit<WebAppItem, 'id' | 'createdAt'>, existingId?: string) => {
      const prevApps = stateRef.current.apps;
      const result = saveAppWithAutoSwap(
        prevApps,
        { ...data, ownerId: firebaseUser?.uid || 'local' },
        existingId
      );
      if (result.swappedAppName && result.swappedToSlot !== undefined) {
        const num = String(result.swappedToSlot + 1).padStart(2, '0');
        showSwapToast(
          `Auto-Swap: "${result.swappedAppName}" foi movido para o Slot #${num}`
        );
      }
      setState((prev) => ({
        ...prev,
        apps: result.apps,
      }));

      if (firebaseUser) {
        void (async () => {
          try {
            setFirebaseSyncing(true);
            await saveAppItemToFirestore(firebaseUser.uid, result.savedApp);
            if (result.swappedToSlot !== undefined) {
              const swappedItem = result.apps.find(
                (a) =>
                  a.slotIndex === result.swappedToSlot &&
                  a.id !== result.savedApp.id
              );
              if (swappedItem) {
                await saveAppItemToFirestore(firebaseUser.uid, swappedItem);
              }
            }
            setLastSyncedAt(Date.now());
          } catch (err) {
            setFirebaseError(
              err instanceof Error ? err.message : 'Erro ao salvar no Firestore'
            );
          } finally {
            setFirebaseSyncing(false);
          }
        })();
      }
    },
    [firebaseUser, showSwapToast]
  );

  const handleDeleteApp = useCallback(
    async (id: string) => {
      setState((prev) => ({
        ...prev,
        apps: prev.apps.filter((a) => a.id !== id),
      }));
      if (spotlightApp?.id === id) setSpotlightApp(null);
      if (previewApp?.id === id) setPreviewApp(null);
      if (firebaseUser) {
        try {
          setFirebaseSyncing(true);
          await deleteAppFromFirestore(firebaseUser, id);
          setLastSyncedAt(Date.now());
        } catch {
          // Handled via sync
        } finally {
          setFirebaseSyncing(false);
        }
      }
    },
    [firebaseUser, previewApp?.id, spotlightApp?.id]
  );

  const handleSwapSlots = useCallback(
    (sourceSlot: number, targetSlot: number) => {
      const prevApps = stateRef.current.apps;
      const targetOccupant = prevApps.find((a) => a.slotIndex === targetSlot);
      const nextApps = swapSlotPositions(prevApps, sourceSlot, targetSlot);
      if (targetOccupant) {
        const srcNum = String(sourceSlot + 1).padStart(2, '0');
        showSwapToast(
          `Posições trocadas: "${targetOccupant.name}" movido para #${srcNum}`
        );
      }
      setState((prev) => ({
        ...prev,
        apps: nextApps,
      }));

      if (firebaseUser) {
        const changed = nextApps.filter(
          (a) => a.slotIndex === sourceSlot || a.slotIndex === targetSlot
        );
        void syncSlotSwapToFirestore(firebaseUser.uid, changed);
      }
    },
    [firebaseUser, showSwapToast]
  );

  const handleOpenAddModal = useCallback((slotIndex: number | null = null) => {
    setEditingApp(null);
    setTargetSlotForNew(slotIndex);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((app: WebAppItem) => {
    setEditingApp(app);
    setTargetSlotForNew(app.slotIndex);
    setIsFormOpen(true);
  }, []);

  // Global Keyboard Shortcuts (Cmd/Ctrl+K, Cmd/Ctrl+M, 1/2/3/4, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Cmd/Ctrl + K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Cmd/Ctrl + M -> Toggle Dynamic Island Minimized TopBar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsTopBarMinimized((prev) => !prev);
        return;
      }

      // Escape -> Close active overlay or clear filter/edit mode
      if (e.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null);
          return;
        }
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (previewApp) {
          setPreviewApp(null);
          return;
        }
        if (spotlightApp) {
          setSpotlightApp(null);
          return;
        }
        if (isFormOpen) {
          setIsFormOpen(false);
          return;
        }
        if (isCloudModalOpen) {
          setIsCloudModalOpen(false);
          return;
        }
        if (hasActiveFilter) {
          handleClearFilter();
          return;
        }
        if (isEditMode) {
          setIsEditMode(false);
          return;
        }
      }

      // Quick Mode Switching (1, 2, 3, 4) when outside inputs and no modal open
      if (
        !isInput &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isCommandPaletteOpen &&
        !isFormOpen &&
        !spotlightApp &&
        !previewApp &&
        !isCloudModalOpen
      ) {
        if (e.key === '1') {
          setState((p) => ({ ...p, viewMode: 'grid' }));
        } else if (e.key === '2') {
          setState((p) => ({ ...p, viewMode: 'sphere' }));
        } else if (e.key === '3') {
          setState((p) => ({ ...p, viewMode: 'pixel-studio' }));
        } else if (e.key === '4') {
          setState((p) => ({ ...p, viewMode: 'retro-os' }));
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    contextMenu,
    handleClearFilter,
    hasActiveFilter,
    isCloudModalOpen,
    isCommandPaletteOpen,
    isEditMode,
    isFormOpen,
    previewApp,
    spotlightApp,
  ]);

  // Wallpaper Theme Classes
  const wallpaperClass =
    state.wallpaperTheme === 'cyber'
      ? 'bg-gradient-to-br from-fuchsia-950 via-zinc-950 to-cyan-950'
      : state.wallpaperTheme === 'ocean'
        ? 'bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950'
        : state.wallpaperTheme === 'midnight'
          ? 'bg-zinc-950'
          : 'bg-gradient-to-br from-indigo-950/90 via-zinc-950 to-purple-950/80';

  const isAnyOverlayOpen = Boolean(
    isCommandPaletteOpen ||
      isFormOpen ||
      spotlightApp ||
      previewApp ||
      isCloudModalOpen ||
      contextMenu
  );

  return (
    <div
      className={`relative w-screen h-[100dvh] overflow-hidden flex flex-col ${wallpaperClass} text-zinc-100 font-sans select-none`}
    >
      {/* Layer A: Persistent TopBar + Dynamic Island Mode */}
      <TopBar
        hubTitle={state.hubTitle}
        onUpdateHubTitle={(hubTitle) =>
          setState((prev) => ({ ...prev, hubTitle }))
        }
        viewMode={state.viewMode}
        onViewModeChange={(viewMode) => {
          setRetroRoomFilter(undefined);
          setState((prev) => ({ ...prev, viewMode }));
        }}
        wallpaperTheme={state.wallpaperTheme}
        onWallpaperChange={(wallpaperTheme: WallpaperTheme) =>
          setState((prev) => ({ ...prev, wallpaperTheme }))
        }
        gridDensity={state.gridDensity}
        onGridDensityChange={(gridDensity: GridDensity) =>
          setState((prev) => ({ ...prev, gridDensity }))
        }
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onClearFilter={handleClearFilter}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onAddClick={() => handleOpenAddModal(null)}
        onOpenCloudSync={() => setIsCloudModalOpen(true)}
        cloudConnected={Boolean(cloudEndpoint)}
        firebaseLoggedIn={Boolean(firebaseUser)}
        firebaseSyncing={firebaseSyncing}
        isMinimized={isTopBarMinimized}
        onToggleMinimized={() => setIsTopBarMinimized((prev) => !prev)}
        directLaunchMode={Boolean(state.directLaunchMode)}
        onToggleDirectLaunchMode={() =>
          setState((prev) => ({
            ...prev,
            directLaunchMode: !prev.directLaunchMode,
          }))
        }
        totalAppsCount={state.apps.length}
      />

      {/* Layer B: Dynamic Central Viewport (100% remaining height, zero page scroll) */}
      <div className="relative flex-1 w-full min-h-0 overflow-hidden flex flex-col">
        {state.viewMode === 'grid' && (
          <DesktopGrid
            apps={state.apps}
            matchingAppIds={matchingAppIds}
            hasActiveFilter={hasActiveFilter}
            density={state.gridDensity}
            isEditMode={isEditMode}
            onActivateEditMode={() => setIsEditMode(true)}
            onSelectApp={handlePrimaryAppClick}
            onDoubleClickApp={handleDoubleClickApp}
            onOpenExternal={handleOpenExternal}
            onContextMenuApp={handleContextMenuApp}
            onEditApp={handleOpenEditModal}
            onDeleteApp={handleDeleteApp}
            onAddAtSlot={(slotIdx) => handleOpenAddModal(slotIdx)}
            onSwapSlots={handleSwapSlots}
          />
        )}

        {state.viewMode === 'sphere' && (
          <SphereView
            apps={state.apps}
            matchingAppIds={matchingAppIds}
            hasActiveFilter={hasActiveFilter}
            onSelectApp={handlePrimaryAppClick}
            onDoubleClickApp={handleDoubleClickApp}
            onOpenExternal={handleOpenExternal}
            onContextMenuApp={handleContextMenuApp}
            onAddClick={() => handleOpenAddModal(null)}
          />
        )}

        {state.viewMode === 'pixel-studio' && (
          <PixelStudioView
            apps={state.apps}
            matchingAppIds={matchingAppIds}
            hasActiveFilter={hasActiveFilter}
            isInteractionPaused={isAnyOverlayOpen}
            onEnterRetroOSWithFilter={(catFilter) => {
              setRetroRoomFilter(catFilter || undefined);
              setState((prev) => ({ ...prev, viewMode: 'retro-os' }));
            }}
            onPrimaryAppClick={handlePrimaryAppClick}
            onOpenExternal={handleOpenExternal}
            onEditApp={handleOpenEditModal}
            onContextMenuApp={handleContextMenuApp}
            onOpenNewAppModal={() => handleOpenAddModal(null)}
          />
        )}

        {state.viewMode === 'retro-os' && (
          <RetroOSView
            apps={state.apps}
            matchingAppIds={matchingAppIds}
            hasActiveFilter={hasActiveFilter}
            density={state.gridDensity}
            isEditMode={isEditMode}
            activeRoomCategoryFilter={retroRoomFilter}
            onClearRoomFilter={() => setRetroRoomFilter(undefined)}
            onBackToPixelStudio={() =>
              setState((prev) => ({ ...prev, viewMode: 'pixel-studio' }))
            }
            onSelectApp={handlePrimaryAppClick}
            onOpenExternal={handleOpenExternal}
            onTransferToModernPreview={(app) => setPreviewApp(app)}
            onContextMenuApp={handleContextMenuApp}
            onEditApp={handleOpenEditModal}
            onDeleteApp={handleDeleteApp}
            onAddAtSlot={(slotIdx) => handleOpenAddModal(slotIdx)}
            onSwapSlots={handleSwapSlots}
          />
        )}

        {/* Contextual Onboarding Toast (4 seconds on first visit to each mode) */}
        {onboardingToast && !swapToast && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-zinc-950/90 border border-indigo-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-mono text-[11px]">{onboardingToast}</span>
          </div>
        )}

        {/* Auto-Swap Feedback Toast */}
        {swapToast && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-950/95 border border-amber-400/50 shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs text-amber-100 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{swapToast}</span>
          </div>
        )}
      </div>

      {/* Layer C: Modals, Overlays & Custom Native Context Menu */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        apps={state.apps}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectApp={(app) => setSpotlightApp(app)}
        onOpenInternal={handleOpenInternal}
        onOpenExternal={handleOpenExternal}
        onEditApp={handleOpenEditModal}
        onCreateNewApp={() => handleOpenAddModal(null)}
      />

      <AppContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onOpenInternal={handleOpenInternal}
        onOpenExternal={handleOpenExternal}
        onEditApp={handleOpenEditModal}
        onToggleExternalOnly={handleToggleExternalOnly}
        onDeleteApp={handleDeleteApp}
      />

      <AppSpotlightModal
        app={spotlightApp}
        onClose={() => setSpotlightApp(null)}
        onOpenInternal={handleOpenInternal}
        onOpenExternal={handleOpenExternal}
        onEdit={handleOpenEditModal}
        onToggleExternalOnly={handleToggleExternalOnly}
      />

      <LivePreviewModal
        app={previewApp}
        onClose={() => setPreviewApp(null)}
        onOpenExternal={handleOpenExternal}
        onToggleExternalOnly={handleToggleExternalOnly}
      />

      <AppFormModal
        isOpen={isFormOpen}
        initialData={editingApp}
        targetSlot={targetSlotForNew}
        existingApps={state.apps}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveApp}
      />

      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentUser={firebaseUser}
        onSignInGoogle={async () => {
          await loginWithGoogleFirebase();
        }}
        onSignOutGoogle={async () => {
          await logoutFirebase();
        }}
        cloudRestUrl={cloudEndpoint}
        onSaveCloudRestUrl={(url) => {
          setCloudEndpoint(url);
          localStorage.setItem(CLOUD_ENDPOINT_KEY, url);
          setState((prev) => ({ ...prev, cloudRestUrl: url }));
        }}
        onSyncNow={async () => {
          if (firebaseUser) {
            setFirebaseSyncing(true);
            try {
              await saveLauncherToFirestore(firebaseUser, state);
              setLastSyncedAt(Date.now());
            } finally {
              setFirebaseSyncing(false);
            }
          } else if (cloudEndpoint) {
            await fetch(cloudEndpoint, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(state),
            });
            setLastSyncedAt(Date.now());
          }
        }}
        syncStatus={
          firebaseSyncing
            ? 'syncing'
            : firebaseError
              ? 'error'
              : firebaseUser || cloudEndpoint
                ? 'online'
                : 'local'
        }
        lastSyncedAt={
          lastSyncedAt ? new Date(lastSyncedAt).toISOString() : null
        }
        launcherState={state}
        onImportBackup={(imported) => {
          const sanitized = sanitizeLauncherPayload({
            ...state,
            ...imported,
          });
          if (sanitized) {
            setState(sanitized);
            showSwapToast('Backup importado com sucesso!');
          }
        }}
        onRestoreDemoApps={() => {
          setState({
            hubTitle: 'My Web Creations Hub',
            theme: 'aurora',
            wallpaperTheme: 'aurora',
            clickBehavior: 'preview',
            directLaunchMode: false,
            viewMode: 'grid',
            gridDensity: 'normal',
            cloudRestUrl: cloudEndpoint,
            apps: INITIAL_DEMO_APPS,
          });
          showSwapToast('Grade restaurada para o padrão inicial.');
        }}
      />
    </div>
  );
}

export default App;
