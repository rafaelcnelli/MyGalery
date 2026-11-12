import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onSnapshot, query, where } from 'firebase/firestore';
import {
  auth,
  db,
  collection,
  doc,
  testFirestoreConnection,
  signInWithGoogle,
  signOutUser,
  ensureOrUpdateWorkspaceDoc,
  saveAppItemToFirestore,
  syncSlotSwapToFirestore,
  deleteAppItemFromFirestore,
  seedAppsToFirestore,
  mapFirestoreDocToApp,
  handleFirestoreError,
  OperationType,
  isFirebaseConfigured,
} from './lib/firebase';
import {
  ClickBehavior,
  GridColumnsPerRow,
  GridScale,
  INITIAL_DEMO_APPS,
  LauncherState,
  LauncherViewMode,
  SyncStatus,
  WALLPAPER_THEMES,
  WallpaperTheme,
  WebAppItem,
} from './types/launcher';
import {
  deduplicateSlots,
  getMatchingAppIds,
  moveOrSwapAppSlot,
  sanitizeWebAppItem,
  upsertAppWithAutoSwap,
} from './utils/launcherLogic';
import { TopBar } from './components/TopBar';
import { DesktopGrid } from './components/DesktopGrid';
import { SphereView } from './components/SphereView';
import { AppFormModal } from './components/AppFormModal';
import { LivePreviewModal } from './components/LivePreviewModal';
import { AppSpotlightModal } from './components/AppSpotlightModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const LOCAL_STORAGE_KEY = 'sonoma_web_os_launcher_v1';

function getDefaultColumnsForViewport(): GridColumnsPerRow {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return 4;
  }
  return 8;
}

function loadInitialState(): LauncherState {
  const defaultCols = getDefaultColumnsForViewport();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return {
        hubTitle: 'My Web Creations Hub',
        theme: 'aurora',
        clickBehavior: 'preview',
        viewMode: 'grid',
        gridColumns: defaultCols,
        gridScale: defaultCols === 4 ? 'compact' : 'normal',
        cloudRestUrl: '',
        apps: INITIAL_DEMO_APPS,
        lastSyncedAt: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<LauncherState>;
    const apps =
      Array.isArray(parsed.apps) && parsed.apps.length > 0
        ? deduplicateSlots(
            parsed.apps.map((a) => sanitizeWebAppItem(a, a.ownerId || 'local'))
          )
        : INITIAL_DEMO_APPS;

    const validCols: GridColumnsPerRow =
      parsed.gridColumns === 2 ||
      parsed.gridColumns === 3 ||
      parsed.gridColumns === 4 ||
      parsed.gridColumns === 6 ||
      parsed.gridColumns === 8
        ? parsed.gridColumns
        : defaultCols;

    return {
      hubTitle: parsed.hubTitle || 'My Web Creations Hub',
      theme:
        parsed.theme && parsed.theme in WALLPAPER_THEMES
          ? parsed.theme
          : 'aurora',
      clickBehavior:
        parsed.clickBehavior === 'new_tab' ? 'new_tab' : 'preview',
      viewMode: parsed.viewMode === 'sphere' ? 'sphere' : 'grid',
      gridColumns: validCols,
      gridScale:
        parsed.gridScale === 'xs' || parsed.gridScale === 'compact'
          ? parsed.gridScale
          : 'normal',
      cloudRestUrl: parsed.cloudRestUrl || '',
      apps,
      lastSyncedAt: parsed.lastSyncedAt || null,
    };
  } catch {
    return {
      hubTitle: 'My Web Creations Hub',
      theme: 'aurora',
      clickBehavior: 'preview',
      viewMode: 'grid',
      gridColumns: defaultCols,
      gridScale: defaultCols === 4 ? 'compact' : 'normal',
      cloudRestUrl: '',
      apps: INITIAL_DEMO_APPS,
      lastSyncedAt: null,
    };
  }
}

export default function App() {
  const [state, setState] = useState<LauncherState>(loadInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isOrganizeMode, setIsOrganizeMode] = useState(false);

  // Modals & Spotlight state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<WebAppItem | null>(null);
  const [targetNewSlot, setTargetNewSlot] = useState<number | null>(null);
  const [highlightedAppId, setHighlightedAppId] = useState<string | null>(null);
  const [previewingApp, setPreviewingApp] = useState<WebAppItem | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Menu Minimized State
  const [isMenuMinimized, setIsMenuMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sonoma_menu_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleMinimizeMenu = useCallback(() => {
    setIsMenuMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sonoma_menu_minimized', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Cloud & Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 1. Validate Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // 2. Save state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist state to localStorage:', e);
    }
  }, [state]);

  // 3. Track Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthReady(true);
      setSyncStatus('local');
      return;
    }
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
          setIsAuthReady(true);
          if (user) {
            setSyncStatus('online');
          } else if (stateRef.current.cloudRestUrl) {
            setSyncStatus('online');
          } else {
            setSyncStatus('local');
          }
        },
        (error) => {
          console.warn('Firebase Auth error:', error);
          setIsAuthReady(true);
          setSyncStatus('local');
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase Auth init error:', e);
      setIsAuthReady(true);
      setSyncStatus('local');
    }
  }, []);

  // 4. Real-time Firestore synchronization when user is authenticated
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const uid = currentUser.uid;
    const workspacePath = `workspaces/${uid}`;
    const appsPath = `workspaces/${uid}/apps`;

    let isCancelled = false;
    let unsubWorkspace: (() => void) | null = null;
    let unsubApps: (() => void) | null = null;

    const initFirestoreSync = async () => {
      try {
        await ensureOrUpdateWorkspaceDoc(uid, {
          hubTitle: stateRef.current.hubTitle,
          theme: stateRef.current.theme,
          clickBehavior: stateRef.current.clickBehavior,
        });
      } catch {
        return;
      }

      if (isCancelled) return;

      unsubWorkspace = onSnapshot(
        doc(db, 'workspaces', uid),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setState((prev) => ({
              ...prev,
              hubTitle: String(data.hubTitle || prev.hubTitle),
              theme:
                data.theme && data.theme in WALLPAPER_THEMES
                  ? (data.theme as WallpaperTheme)
                  : prev.theme,
              clickBehavior:
                data.clickBehavior === 'new_tab' ? 'new_tab' : 'preview',
              lastSyncedAt: new Date().toISOString(),
            }));
            setSyncStatus('online');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, workspacePath);
        }
      );

      const appsQuery = query(
        collection(db, 'workspaces', uid, 'apps'),
        where('ownerId', '==', uid)
      );

      let hasSeededInitial = false;
      unsubApps = onSnapshot(
        appsQuery,
        (snapshot) => {
          if (snapshot.empty && !hasSeededInitial) {
            hasSeededInitial = true;
            seedAppsToFirestore(uid, stateRef.current.apps).catch(() => {});
            return;
          }
          hasSeededInitial = true;
          const remoteApps: WebAppItem[] = [];
          snapshot.forEach((docSnap) => {
            remoteApps.push(
              mapFirestoreDocToApp(
                docSnap.id,
                docSnap.data() as Record<string, unknown>
              )
            );
          });
          if (remoteApps.length > 0) {
            setState((prev) => ({
              ...prev,
              apps: deduplicateSlots(remoteApps),
              lastSyncedAt: new Date().toISOString(),
            }));
          }
          setSyncStatus('online');
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, appsPath);
        }
      );
    };

    initFirestoreSync();

    return () => {
      isCancelled = true;
      if (unsubWorkspace) unsubWorkspace();
      if (unsubApps) unsubApps();
    };
  }, [isAuthReady, currentUser]);

  // 5. Custom Cloud Sync REST API: Push (PUT) helper
  const pushToCloudRest = useCallback(
    async (nextState: LauncherState, customUrl?: string) => {
      const endpoint = (customUrl ?? nextState.cloudRestUrl).trim();
      if (!endpoint) return;
      try {
        setSyncStatus('syncing');
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hubTitle: nextState.hubTitle,
            theme: nextState.theme,
            clickBehavior: nextState.clickBehavior,
            apps: nextState.apps,
            updatedAt: new Date().toISOString(),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSyncStatus('online');
        setState((prev) => ({
          ...prev,
          lastSyncedAt: new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('Cloud REST PUT failed:', err);
        setSyncStatus(currentUser ? 'online' : 'local');
      }
    },
    [currentUser]
  );

  // 6. Custom Cloud Sync REST API: Pull (GET) on initial load or URL change
  const pullFromCloudRest = useCallback(
    async (endpointUrl: string) => {
      const endpoint = endpointUrl.trim();
      if (!endpoint) return;
      try {
        setSyncStatus('syncing');
        const res = await fetch(endpoint, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.apps)) {
          const cleanApps = deduplicateSlots(
            data.apps.map((a: Partial<WebAppItem>) =>
              sanitizeWebAppItem(a, currentUser?.uid || 'local')
            )
          );
          setState((prev) => ({
            ...prev,
            hubTitle: data.hubTitle || prev.hubTitle,
            theme:
              data.theme && data.theme in WALLPAPER_THEMES
                ? data.theme
                : prev.theme,
            clickBehavior:
              data.clickBehavior === 'new_tab'
                ? 'new_tab'
                : prev.clickBehavior,
            apps: cleanApps,
            lastSyncedAt: new Date().toISOString(),
          }));
          setSyncStatus('online');
          showToast('Galeria sincronizada da nuvem com sucesso!');
        } else {
          await pushToCloudRest(stateRef.current, endpoint);
        }
      } catch (err) {
        console.warn('Cloud REST GET failed:', err);
        setSyncStatus(currentUser ? 'online' : 'local');
      }
    },
    [currentUser, pushToCloudRest, showToast]
  );

  useEffect(() => {
    if (state.cloudRestUrl) {
      pullFromCloudRest(state.cloudRestUrl);
    }
  }, [state.cloudRestUrl, pullFromCloudRest]);

  // Handlers for Workspace Preferences
  const handleUpdateHubTitle = (newTitle: string) => {
    setState((prev) => {
      const next = { ...prev, hubTitle: newTitle };
      pushToCloudRest(next);
      if (currentUser) {
        ensureOrUpdateWorkspaceDoc(currentUser.uid, {
          hubTitle: newTitle,
          theme: next.theme,
          clickBehavior: next.clickBehavior,
        }).catch(() => {});
      }
      return next;
    });
  };

  const handleChangeTheme = (newTheme: WallpaperTheme) => {
    setState((prev) => {
      const next = { ...prev, theme: newTheme };
      pushToCloudRest(next);
      if (currentUser) {
        ensureOrUpdateWorkspaceDoc(currentUser.uid, {
          hubTitle: next.hubTitle,
          theme: newTheme,
          clickBehavior: next.clickBehavior,
        }).catch(() => {});
      }
      return next;
    });
  };

  const handleToggleClickBehavior = (newBehavior: ClickBehavior) => {
    setState((prev) => {
      const next = { ...prev, clickBehavior: newBehavior };
      pushToCloudRest(next);
      if (currentUser) {
        ensureOrUpdateWorkspaceDoc(currentUser.uid, {
          hubTitle: next.hubTitle,
          theme: next.theme,
          clickBehavior: newBehavior,
        }).catch(() => {});
      }
      return next;
    });
  };

  // Handlers for Apps CRUD & Slot Positioning
  const handleMoveOrSwapSlot = (appId: string, targetSlotIndex: number) => {
    setState((prev) => {
      const { updatedApps, swappedWithApp, didChange } = moveOrSwapAppSlot(
        prev.apps,
        appId,
        targetSlotIndex
      );
      if (!didChange) return prev;

      const movedApp = updatedApps.find((a) => a.id === appId);
      if (swappedWithApp && movedApp) {
        showToast(
          `Posições trocadas: ${movedApp.name} ⇄ ${swappedWithApp.name}`
        );
      }

      const next = { ...prev, apps: updatedApps };
      pushToCloudRest(next);

      if (currentUser && movedApp) {
        const changed = swappedWithApp
          ? [
              movedApp,
              updatedApps.find((a) => a.id === swappedWithApp.id)!,
            ].filter(Boolean)
          : [movedApp];
        syncSlotSwapToFirestore(currentUser.uid, changed).catch(() => {});
      }

      return next;
    });
  };

  const handleSaveApp = (incomingApp: WebAppItem) => {
    setState((prev) => {
      const { updatedApps, swappedOccupant } = upsertAppWithAutoSwap(
        prev.apps,
        incomingApp
      );
      if (swappedOccupant) {
        showToast(
          `${incomingApp.name} posicionado no Slot #${incomingApp.slotIndex} (trocou com ${swappedOccupant.name})`
        );
      } else {
        showToast(
          `${incomingApp.name} salvo no Slot #${String(
            incomingApp.slotIndex
          ).padStart(2, '0')}`
        );
      }

      const next = { ...prev, apps: updatedApps };
      pushToCloudRest(next);

      if (currentUser) {
        saveAppItemToFirestore(currentUser.uid, incomingApp).catch(() => {});
        if (swappedOccupant) {
          saveAppItemToFirestore(currentUser.uid, swappedOccupant).catch(
            () => {}
          );
        }
      }

      return next;
    });
  };

  const handleDeleteApp = (appId: string) => {
    if (highlightedAppId === appId) {
      setHighlightedAppId(null);
    }
    setState((prev) => {
      const target = prev.apps.find((a) => a.id === appId);
      const updatedApps = prev.apps.filter((a) => a.id !== appId);
      if (target) {
        showToast(`"${target.name}" removido do grid.`);
      }
      const next = { ...prev, apps: updatedApps };
      pushToCloudRest(next);

      if (currentUser) {
        deleteAppItemFromFirestore(currentUser.uid, appId).catch(() => {});
      }
      return next;
    });
  };

  // Clicking an app highlights it in Spotlight with Edit Icon + Bottom Action Buttons
  const handlePrimaryAppClick = (app: WebAppItem) => {
    setHighlightedAppId(app.id);
  };

  const handleSyncNow = async () => {
    if (state.cloudRestUrl) {
      await pullFromCloudRest(state.cloudRestUrl);
      await pushToCloudRest(stateRef.current);
    }
    if (currentUser) {
      setSyncStatus('syncing');
      await ensureOrUpdateWorkspaceDoc(currentUser.uid, {
        hubTitle: state.hubTitle,
        theme: state.theme,
        clickBehavior: state.clickBehavior,
      });
      await seedAppsToFirestore(currentUser.uid, state.apps);
      setSyncStatus('online');
      setState((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
      }));
      showToast('Sincronização com Cloud Firestore concluída!');
    } else if (!state.cloudRestUrl) {
      showToast('Dados salvos localmente no navegador.');
    }
  };

  const handleImportBackup = (imported: Partial<LauncherState>) => {
    setState((prev) => {
      const cleanApps = Array.isArray(imported.apps)
        ? deduplicateSlots(
            imported.apps.map((a) =>
              sanitizeWebAppItem(a, currentUser?.uid || 'local')
            )
          )
        : prev.apps;

      const next: LauncherState = {
        ...prev,
        hubTitle: imported.hubTitle || prev.hubTitle,
        theme:
          imported.theme && imported.theme in WALLPAPER_THEMES
            ? imported.theme
            : prev.theme,
        clickBehavior:
          imported.clickBehavior === 'new_tab'
            ? 'new_tab'
            : prev.clickBehavior,
        apps: cleanApps,
        lastSyncedAt: new Date().toISOString(),
      };

      pushToCloudRest(next);
      if (currentUser) {
        seedAppsToFirestore(currentUser.uid, cleanApps).catch(() => {});
      }
      return next;
    });
  };

  const handleRestoreDemoApps = () => {
    setState((prev) => {
      const demo = INITIAL_DEMO_APPS.map((a) =>
        sanitizeWebAppItem(a, currentUser?.uid || 'local')
      );
      const next = { ...prev, apps: demo };
      pushToCloudRest(next);
      if (currentUser) {
        seedAppsToFirestore(currentUser.uid, demo).catch(() => {});
      }
      return next;
    });
  };

  const matchingAppIds = getMatchingAppIds(
    state.apps,
    searchQuery,
    selectedCategory
  );
  const hasActiveFilter =
    searchQuery.trim().length > 0 || selectedCategory !== 'ALL';

  const currentWallpaper =
    WALLPAPER_THEMES[state.theme] || WALLPAPER_THEMES.aurora;

  const highlightedApp = highlightedAppId
    ? state.apps.find((a) => a.id === highlightedAppId) || null
    : null;

  return (
    <div
      className={`relative h-dvh w-screen overflow-hidden flex flex-col ${currentWallpaper.baseBg} text-slate-100 select-none`}
    >
      {/* Ambient Radial Diffused Backlights per Wallpaper Theme */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {state.theme === 'aurora' && (
          <>
            <div className="absolute -top-36 -left-36 w-[560px] h-[560px] rounded-full bg-indigo-600/20 blur-[130px]" />
            <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[130px]" />
            <div className="absolute -bottom-32 left-1/3 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
          </>
        )}

        {state.theme === 'midnight' && (
          <>
            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-slate-800/20 blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-indigo-950/25 blur-[140px]" />
          </>
        )}

        {state.theme === 'cyber' && (
          <>
            <div className="absolute -top-24 left-1/3 w-[520px] h-[520px] rounded-full bg-fuchsia-600/15 blur-[140px]" />
            <div className="absolute bottom-[-15%] right-1/4 w-[540px] h-[540px] rounded-full bg-cyan-500/15 blur-[140px]" />
          </>
        )}

        {state.theme === 'ocean' && (
          <>
            <div className="absolute -top-32 left-10 w-[560px] h-[560px] rounded-full bg-cyan-600/20 blur-[130px]" />
            <div className="absolute bottom-[-10%] right-10 w-[560px] h-[560px] rounded-full bg-emerald-600/15 blur-[140px]" />
          </>
        )}
      </div>

      {/* Top OS Dock Bar */}
      <TopBar
        hubTitle={state.hubTitle}
        onUpdateHubTitle={handleUpdateHubTitle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        clickBehavior={state.clickBehavior}
        onToggleClickBehavior={handleToggleClickBehavior}
        viewMode={(state.viewMode || 'grid') as LauncherViewMode}
        onChangeViewMode={(mode) =>
          setState((prev) => ({ ...prev, viewMode: mode }))
        }
        gridColumns={(state.gridColumns || 8) as GridColumnsPerRow}
        onChangeGridColumns={(cols) =>
          setState((prev) => ({
            ...prev,
            gridColumns: cols,
            gridScale: cols === 4 ? 'compact' : prev.gridScale,
          }))
        }
        gridScale={(state.gridScale || 'normal') as GridScale}
        onChangeGridScale={(scale) =>
          setState((prev) => ({ ...prev, gridScale: scale }))
        }
        theme={state.theme}
        onChangeTheme={handleChangeTheme}
        syncStatus={syncStatus}
        isOrganizeMode={isOrganizeMode}
        onToggleOrganizeMode={() => setIsOrganizeMode((prev) => !prev)}
        onOpenNewAppModal={() => {
          setEditingApp(null);
          setTargetNewSlot(null);
          setIsFormModalOpen(true);
        }}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        userEmail={currentUser?.email}
        totalAppsCount={state.apps.length}
        isMinimized={isMenuMinimized}
        onToggleMinimize={handleToggleMinimizeMenu}
      />

      {/* Main Single-Page Viewport: Either Free Grid or WatchOS 3D Sphere */}
      {state.viewMode === 'sphere' ? (
        <SphereView
          apps={state.apps}
          matchingAppIds={matchingAppIds}
          hasActiveFilter={hasActiveFilter}
          highlightedAppId={highlightedAppId}
          onPrimaryAppClick={handlePrimaryAppClick}
          onOpenLivePreview={(app) => setPreviewingApp(app)}
          onOpenEditModal={(app) => {
            setEditingApp(app);
            setTargetNewSlot(app.slotIndex);
            setIsFormModalOpen(true);
          }}
          onOpenNewAppAtSlot={(slotIndex) => {
            setEditingApp(null);
            setTargetNewSlot(slotIndex);
            setIsFormModalOpen(true);
          }}
        />
      ) : (
        <DesktopGrid
          apps={state.apps}
          matchingAppIds={matchingAppIds}
          hasActiveFilter={hasActiveFilter}
          isOrganizeMode={isOrganizeMode}
          gridColumns={(state.gridColumns || 8) as GridColumnsPerRow}
          gridScale={(state.gridScale || 'normal') as GridScale}
          highlightedAppId={highlightedAppId}
          onPrimaryAppClick={handlePrimaryAppClick}
          onOpenLivePreview={(app) => setPreviewingApp(app)}
          onOpenEditModal={(app) => {
            setEditingApp(app);
            setTargetNewSlot(app.slotIndex);
            setIsFormModalOpen(true);
          }}
          onOpenNewAppAtSlot={(slotIndex) => {
            setEditingApp(null);
            setTargetNewSlot(slotIndex);
            setIsFormModalOpen(true);
          }}
          onMoveOrSwapSlot={handleMoveOrSwapSlot}
        />
      )}

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Subtle Floating Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 text-xs font-medium text-slate-100 shadow-2xl"
        >
          {toastMessage}
        </div>
      )}

      {/* Highlighted App Spotlight Modal (Edit Icon + Open in App / Open in Browser) */}
      <AppSpotlightModal
        app={highlightedApp}
        onClose={() => setHighlightedAppId(null)}
        onOpenInApp={(app) => setPreviewingApp(app)}
        onOpenEdit={(app) => {
          setEditingApp(app);
          setTargetNewSlot(app.slotIndex);
          setIsFormModalOpen(true);
        }}
      />

      {/* + Novo Web App / Edit Modal */}
      <AppFormModal
        isOpen={isFormModalOpen}
        editingApp={editingApp}
        initialSlotIndex={targetNewSlot}
        existingApps={state.apps}
        ownerId={currentUser?.uid || 'local'}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingApp(null);
          setTargetNewSlot(null);
        }}
        onSave={handleSaveApp}
        onDelete={handleDeleteApp}
      />

      {/* macOS Sonoma / Full-Screen Mobile Live Preview Window */}
      <LivePreviewModal
        app={previewingApp}
        onClose={() => setPreviewingApp(null)}
      />

      {/* Cloud Sync & Backup Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentUser={currentUser}
        onSignInGoogle={async () => {
          try {
            await signInWithGoogle();
            showToast('Conectado com Google com sucesso!');
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!msg.includes('popup-closed-by-user')) {
              showToast('Não foi possível autenticar com Google no momento.');
            }
          }
        }}
        onSignOutGoogle={async () => {
          try {
            await signOutUser();
            showToast('Sessão desconectada.');
          } catch {
            // ignore
          }
        }}
        cloudRestUrl={state.cloudRestUrl}
        onSaveCloudRestUrl={(url) => {
          setState((prev) => ({ ...prev, cloudRestUrl: url }));
        }}
        onSyncNow={handleSyncNow}
        syncStatus={syncStatus}
        lastSyncedAt={state.lastSyncedAt || null}
        launcherState={state}
        onImportBackup={handleImportBackup}
        onRestoreDemoApps={handleRestoreDemoApps}
      />
    </div>
  );
}
