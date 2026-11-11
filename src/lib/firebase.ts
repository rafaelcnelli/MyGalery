import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ClickBehavior,
  WallpaperTheme,
  WebAppItem,
} from '../types/launcher';
import { sanitizeWebAppItem } from '../utils/launcherLogic';

interface FirebaseAppletConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId: string;
}

// Load local firebase-applet-config.json if present (AI Studio), without failing build when gitignored on GitHub
const localConfigModules = import.meta.glob<{ default: FirebaseAppletConfig }>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const localFileConfig =
  localConfigModules['../../firebase-applet-config.json']?.default;

const firebaseConfig: FirebaseAppletConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    localFileConfig?.apiKey ||
    'demo-local-only-key',
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
    '1:952928530363:web:254ee5ad64721d2c531e9e',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    localFileConfig?.firestoreDatabaseId ||
    'ai-studio-bb4f3703-a328-40a5-8152-a53c6826731d',
};

export const isFirebaseConfigured = Boolean(
  (import.meta.env.VITE_FIREBASE_API_KEY || localFileConfig?.apiKey) &&
    firebaseConfig.apiKey !== 'demo-local-only-key' &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
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
      category: String(data.category || 'Utilitário'),
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
 */
export async function ensureOrUpdateWorkspaceDoc(
  userId: string,
  prefs: {
    hubTitle: string;
    theme: WallpaperTheme;
    clickBehavior: ClickBehavior;
  }
): Promise<void> {
  const path = `workspaces/${userId}`;
  const workspaceRef = doc(db, 'workspaces', userId);
  const safeHubTitle = (prefs.hubTitle || 'My Web Creations Hub')
    .trim()
    .slice(0, 80);

  try {
    const existingSnap = await getDoc(workspaceRef);
    if (!existingSnap.exists()) {
      await setDoc(workspaceRef, {
        uid: userId,
        hubTitle: safeHubTitle,
        theme: prefs.theme,
        clickBehavior: prefs.clickBehavior,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(workspaceRef, {
        hubTitle: safeHubTitle,
        theme: prefs.theme,
        clickBehavior: prefs.clickBehavior,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Creates or updates a single WebAppItem in `/workspaces/{userId}/apps/{appId}`.
 */
export async function saveAppItemToFirestore(
  userId: string,
  appItem: WebAppItem
): Promise<void> {
  const clean = sanitizeWebAppItem(appItem, userId);
  const path = `workspaces/${userId}/apps/${clean.id}`;
  const appRef = doc(db, 'workspaces', userId, 'apps', clean.id);

  try {
    const existing = await getDoc(appRef);
    if (!existing.exists()) {
      await setDoc(appRef, {
        id: clean.id,
        ownerId: userId,
        name: clean.name,
        url: clean.url,
        category: clean.category,
        accentColor: clean.accentColor,
        customLogoUrl: clean.customLogoUrl,
        slotIndex: clean.slotIndex,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(appRef, {
        name: clean.name,
        url: clean.url,
        category: clean.category,
        accentColor: clean.accentColor,
        customLogoUrl: clean.customLogoUrl,
        slotIndex: clean.slotIndex,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates slot positions for one or two swapped apps atomically in Firestore.
 */
export async function syncSlotSwapToFirestore(
  userId: string,
  changedApps: WebAppItem[]
): Promise<void> {
  if (changedApps.length === 0) return;
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
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes an app item from `/workspaces/{userId}/apps/{appId}`.
 */
export async function deleteAppItemFromFirestore(
  userId: string,
  appId: string
): Promise<void> {
  const path = `workspaces/${userId}/apps/${appId}`;
  try {
    await deleteDoc(doc(db, 'workspaces', userId, 'apps', appId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seeds or syncs a list of local apps into Firestore when a user first logs in or imports a backup.
 */
export async function seedAppsToFirestore(
  userId: string,
  apps: WebAppItem[]
): Promise<void> {
  const path = `workspaces/${userId}/apps`;
  try {
    for (const item of apps) {
      await saveAppItemToFirestore(userId, item);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export { collection, doc };
