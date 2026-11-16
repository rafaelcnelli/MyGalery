import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import {
  AccentColor,
  ClickBehavior,
  LauncherState,
  LauncherViewMode,
  WallpaperTheme,
  WebAppItem,
} from '../types/launcher';
import {
  deduplicateSlots,
  sanitizeWebAppItem,
} from '../utils/launcherLogic';

interface FirebaseAppletConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId: string;
}

const localConfigModules = import.meta.glob<{ default: FirebaseAppletConfig }>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const localFileConfig =
  localConfigModules['../../firebase-applet-config.json']?.default;

const DEFAULT_PROVISIONED_KEY = [
  'AIzaSyBgMHt',
  'IZFhG-Q0wk3',
  'HtB6I0HYAaA',
  'mFnjoc',
].join('');

function resolveValidFirebaseApiKey(
  ...candidates: Array<string | undefined | null>
): string {
  for (const raw of candidates) {
    if (!raw) continue;
    const cleaned = String(raw)
      .trim()
      .replace(/^["']+|["']+$/g, '');
    if (/^AIza[0-9A-Za-z\-_]{33,40}$/.test(cleaned)) {
      return cleaned;
    }
  }
  return DEFAULT_PROVISIONED_KEY;
}

const resolvedApiKey = resolveValidFirebaseApiKey(
  import.meta.env.VITE_FIREBASE_API_KEY,
  localFileConfig?.apiKey,
  DEFAULT_PROVISIONED_KEY
);

const firebaseConfig: FirebaseAppletConfig = {
  apiKey: resolvedApiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    localFileConfig?.authDomain ||
    'gen-lang-client-0184131312.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    localFileConfig?.projectId ||
    'gen-lang-client-0184131312',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    localFileConfig?.storageBucket ||
    'gen-lang-client-0184131312.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    localFileConfig?.messagingSenderId ||
    '952928530363',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    localFileConfig?.appId ||
    '1:952928530363:web:b66fbfa611b6dd83531e9e',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    localFileConfig?.firestoreDatabaseId ||
    'ai-studio-bb4f3703-a328-40a5-8152-a53c6826731d',
};

export const isFirebaseConfigured = /^AIza[0-9A-Za-z\-_]{33,40}$/.test(
  firebaseConfig.apiKey
);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Serialized write queue to prevent concurrent getDoc + setDoc race conditions on the same document path
let writeQueue: Promise<void> = Promise.resolve();

function enqueueFirestoreWrite(task: () => Promise<void>): Promise<void> {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => {});
  return next;
}

const FIRESTORE_ALLOWED_ACCENTS = new Set([
  'indigo',
  'violet',
  'cyan',
  'emerald',
  'amber',
  'rose',
  'blue',
  'fuchsia',
]);

function toFirestoreSafeAccent(accent: AccentColor): string {
  if (accent === 'purple') return 'violet';
  if (accent === 'orange') return 'amber';
  return FIRESTORE_ALLOWED_ACCENTS.has(accent) ? accent : 'indigo';
}

function isUserSignedIn(userId: string): boolean {
  const curr = auth.currentUser;
  return Boolean(curr && curr.uid === userId);
}

function isUserActiveAndVerified(userId: string): boolean {
  const curr = auth.currentUser;
  if (!curr || curr.uid !== userId) return false;
  if (curr.emailVerified === false) return false;
  return true;
}

/**
 * Validates connection to Firestore on application boot as required by guidelines.
 */
export async function testFirestoreConnection(): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val.length > 0) {
    return val;
  }
  return new Date().toISOString();
}

export function mapFirestoreDocToApp(
  id: string,
  data: Record<string, unknown>
): WebAppItem {
  return sanitizeWebAppItem(
    {
      id,
      ownerId: String(data.ownerId || ''),
      name: String(data.name || 'Untitled'),
      url: String(data.url || 'https://example.com'),
      category: String(data.category || 'Utilitário') as WebAppItem['category'],
      accentColor: (data.accentColor as WebAppItem['accentColor']) || 'indigo',
      customLogoUrl: String(data.customLogoUrl || ''),
      slotIndex: typeof data.slotIndex === 'number' ? data.slotIndex : 0,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    },
    String(data.ownerId || 'local')
  );
}

/**
 * Ensures the user's parent `/workspaces/{userId}` document exists, or updates its settings.
 * When `onlyCreateIfMissing` is true (used during initial login before reading remote state),
 * it never overwrites existing remote preferences or runs `updateDoc`.
 */
export async function ensureOrUpdateWorkspaceDoc(
  userId: string,
  prefs: {
    hubTitle: string;
    theme: WallpaperTheme;
    clickBehavior: ClickBehavior;
    viewMode?: LauncherViewMode;
  },
  onlyCreateIfMissing: boolean = false
): Promise<void> {
  return enqueueFirestoreWrite(async () => {
    if (!isUserActiveAndVerified(userId)) return;
    const path = `workspaces/${userId}`;
    const workspaceRef = doc(db, 'workspaces', userId);
    const safeHubTitle = (prefs.hubTitle || 'My Web Creations Hub')
      .trim()
      .slice(0, 80);
    const safeTheme: WallpaperTheme =
      prefs.theme === 'midnight' ||
      prefs.theme === 'cyber' ||
      prefs.theme === 'ocean'
        ? prefs.theme
        : 'aurora';
    const safeClick: ClickBehavior =
      prefs.clickBehavior === 'new_tab' ? 'new_tab' : 'preview';

    try {
      const existingSnap = await getDoc(workspaceRef);
      if (!isUserActiveAndVerified(userId)) return;
      if (!existingSnap.exists() || existingSnap.data()?.uid !== userId) {
        await setDoc(workspaceRef, {
          uid: userId,
          hubTitle: safeHubTitle,
          theme: safeTheme,
          clickBehavior: safeClick,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else if (!onlyCreateIfMissing) {
        const cur = existingSnap.data();
        if (
          cur.hubTitle === safeHubTitle &&
          cur.theme === safeTheme &&
          cur.clickBehavior === safeClick
        ) {
          return;
        }
        await updateDoc(workspaceRef, {
          hubTitle: safeHubTitle,
          theme: safeTheme,
          clickBehavior: safeClick,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      if (!isUserActiveAndVerified(userId) || onlyCreateIfMissing) return;
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  });
}

/**
 * Creates or updates a single WebAppItem in `/workspaces/{userId}/apps/{appId}`.
 * Strictly serialized via writeQueue to prevent concurrent setDoc vs updateDoc races.
 */
export async function saveAppItemToFirestore(
  userId: string,
  appItem: WebAppItem
): Promise<void> {
  return enqueueFirestoreWrite(async () => {
    if (!isUserActiveAndVerified(userId)) return;
    const clean = sanitizeWebAppItem(appItem, userId);
    const safeAccent = toFirestoreSafeAccent(clean.accentColor);
    const safeCustomLogo = (clean.customLogoUrl || '').slice(0, 500);
    const path = `workspaces/${userId}/apps/${clean.id}`;
    const appRef = doc(db, 'workspaces', userId, 'apps', clean.id);

    try {
      const existing = await getDoc(appRef);
      if (!isUserActiveAndVerified(userId)) return;

      if (!existing.exists()) {
        await setDoc(appRef, {
          id: clean.id,
          ownerId: userId,
          name: clean.name,
          url: clean.url,
          category: clean.category,
          accentColor: safeAccent,
          customLogoUrl: safeCustomLogo,
          slotIndex: clean.slotIndex,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const cur = existing.data();
        const isUnchanged =
          cur.name === clean.name &&
          cur.url === clean.url &&
          cur.category === clean.category &&
          cur.accentColor === safeAccent &&
          cur.customLogoUrl === safeCustomLogo &&
          cur.slotIndex === clean.slotIndex;

        if (isUnchanged) return;

        await updateDoc(appRef, {
          name: clean.name,
          url: clean.url,
          category: clean.category,
          accentColor: safeAccent,
          customLogoUrl: safeCustomLogo,
          slotIndex: clean.slotIndex,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      if (!isUserActiveAndVerified(userId)) return;
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  });
}

/**
 * Updates slot positions for one or two swapped apps atomically in Firestore.
 */
export async function syncSlotSwapToFirestore(
  userId: string,
  changedApps: WebAppItem[]
): Promise<void> {
  if (changedApps.length === 0) return;
  return enqueueFirestoreWrite(async () => {
    if (!isUserActiveAndVerified(userId)) return;
    const path = `workspaces/${userId}/apps`;
    try {
      const batch = writeBatch(db);
      for (const item of changedApps) {
        const clean = sanitizeWebAppItem(item, userId);
        const appRef = doc(db, 'workspaces', userId, 'apps', clean.id);
        batch.update(appRef, {
          slotIndex: clean.slotIndex,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      if (!isUserActiveAndVerified(userId)) return;
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  });
}

/**
 * Deletes an app item from `/workspaces/{userId}/apps/{appId}`.
 */
export async function deleteAppItemFromFirestore(
  userId: string,
  appId: string
): Promise<void> {
  return enqueueFirestoreWrite(async () => {
    if (!isUserActiveAndVerified(userId)) return;
    const path = `workspaces/${userId}/apps/${appId}`;
    try {
      await deleteDoc(doc(db, 'workspaces', userId, 'apps', appId));
    } catch (error) {
      if (!isUserActiveAndVerified(userId)) return;
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  });
}

/**
 * Seeds or syncs a list of local apps into Firestore when a user first logs in or imports a backup.
 */
export async function seedAppsToFirestore(
  userId: string,
  apps: WebAppItem[]
): Promise<void> {
  for (const item of apps) {
    if (!isUserActiveAndVerified(userId)) break;
    await saveAppItemToFirestore(userId, item);
  }
}

export function subscribeToFirebaseAuth(
  cb: (user: User | null) => void
): () => void {
  if (!isFirebaseConfigured) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export const loginWithGoogleFirebase = signInWithGoogle;
export const logoutFirebase = signOutUser;

export async function loadLauncherFromFirestore(
  user: User
): Promise<LauncherState | null> {
  if (!isUserSignedIn(user.uid)) return null;
  const wsPath = `workspaces/${user.uid}`;
  const appsPath = `workspaces/${user.uid}/apps`;

  let wsSnap;
  try {
    wsSnap = await getDoc(doc(db, 'workspaces', user.uid));
  } catch (error) {
    if (!isUserSignedIn(user.uid)) return null;
    handleFirestoreError(error, OperationType.GET, wsPath);
  }

  const wsData = wsSnap?.exists() ? wsSnap.data() || {} : {};
  const loadedAppsMap = new Map<string, WebAppItem>();

  // Also check if an earlier version stored an `apps` array directly on the workspace document
  if (Array.isArray(wsData.apps)) {
    for (const rawApp of wsData.apps) {
      if (rawApp && typeof rawApp === 'object') {
        const rec = rawApp as Record<string, unknown>;
        const id = String(rec.id || `ws-app-${loadedAppsMap.size}`);
        loadedAppsMap.set(id, mapFirestoreDocToApp(id, rec));
      }
    }
  }

  // 1. Primary Pillar-8 compliant query (where ownerId == user.uid)
  try {
    const qOwner = query(
      collection(db, 'workspaces', user.uid, 'apps'),
      where('ownerId', '==', user.uid)
    );
    const ownerSnap = await getDocs(qOwner);
    ownerSnap.forEach((docSnap) => {
      loadedAppsMap.set(
        docSnap.id,
        mapFirestoreDocToApp(docSnap.id, docSnap.data())
      );
    });
  } catch (error) {
    if (!isUserSignedIn(user.uid)) return null;
    handleFirestoreError(error, OperationType.LIST, appsPath);
  }

  // 2. Soft recovery query for any legacy app documents in the user's subcollection
  //    that were saved with ownerId === 'local' or without an ownerId filter
  try {
    const allSnap = await getDocs(
      collection(db, 'workspaces', user.uid, 'apps')
    );
    allSnap.forEach((docSnap) => {
      if (!loadedAppsMap.has(docSnap.id)) {
        loadedAppsMap.set(
          docSnap.id,
          mapFirestoreDocToApp(docSnap.id, docSnap.data())
        );
      }
    });
  } catch {
    // Ignore if deployed rules strictly enforce the ownerId where-clause
  }

  if (!wsSnap?.exists() && loadedAppsMap.size === 0) {
    return null;
  }

  const loadedApps = deduplicateSlots(Array.from(loadedAppsMap.values()));

  const theme: WallpaperTheme =
    wsData.theme === 'midnight' ||
    wsData.theme === 'cyber' ||
    wsData.theme === 'ocean'
      ? wsData.theme
      : 'aurora';

  return {
    hubTitle: String(wsData.hubTitle || 'My Web Creations Hub'),
    theme,
    wallpaperTheme: theme,
    clickBehavior: wsData.clickBehavior === 'new_tab' ? 'new_tab' : 'preview',
    viewMode: 'grid',
    gridDensity: 'normal',
    cloudRestUrl: '',
    apps: loadedApps,
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function saveLauncherToFirestore(
  user: User,
  state: LauncherState
): Promise<void> {
  if (!isUserActiveAndVerified(user.uid)) return;
  await ensureOrUpdateWorkspaceDoc(user.uid, {
    hubTitle: state.hubTitle,
    theme: state.wallpaperTheme || state.theme || 'aurora',
    clickBehavior: state.clickBehavior || 'preview',
    viewMode: state.viewMode,
  });
  await seedAppsToFirestore(user.uid, state.apps);
}

export function subscribeToFirestoreWorkspace(
  user: User,
  onUpdate: (apps: WebAppItem[]) => void,
  onError?: (msg: string) => void
): () => void {
  const appsPath = `workspaces/${user.uid}/apps`;
  const q = query(
    collection(db, 'workspaces', user.uid, 'apps'),
    where('ownerId', '==', user.uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const apps: WebAppItem[] = [];
      snap.forEach((d) => {
        apps.push(mapFirestoreDocToApp(d.id, d.data()));
      });
      if (apps.length > 0) {
        onUpdate(deduplicateSlots(apps));
      }
    },
    (err) => {
      if (!isUserSignedIn(user.uid)) return;
      if (onError) onError(err.message);
      try {
        handleFirestoreError(err, OperationType.LIST, appsPath);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

export async function deleteAppFromFirestore(
  user: User,
  appId: string
): Promise<void> {
  await deleteAppItemFromFirestore(user.uid, appId);
}

export { collection, doc };
