import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Deterministic evaluator for the "Dirty Dozen" security payloads and Firestore rule invariants
 * defined in security_spec.md and firestore.rules.
 */
interface AuthContext {
  uid: string;
  email_verified: boolean;
}

const REQUEST_TIME = '2026-11-11T06:45:00.000Z';

function isValidId(id: unknown): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_-]+$/.test(id)
  );
}

function evaluateWorkspaceCreate(
  auth: AuthContext | null,
  userId: string,
  payload: Record<string, unknown>
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(userId) || userId !== auth.uid) return 'PERMISSION_DENIED';

  const requiredKeys = ['uid', 'hubTitle', 'theme', 'clickBehavior', 'createdAt', 'updatedAt'];
  const keys = Object.keys(payload);
  if (
    !requiredKeys.every((k) => keys.includes(k)) ||
    !keys.every((k) => requiredKeys.includes(k))
  ) {
    return 'PERMISSION_DENIED';
  }

  if (
    typeof payload.uid !== 'string' ||
    payload.uid !== auth.uid ||
    payload.uid !== userId
  ) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof payload.hubTitle !== 'string' ||
    payload.hubTitle.length < 1 ||
    payload.hubTitle.length > 80
  ) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof payload.theme !== 'string' ||
    !['aurora', 'midnight', 'cyber', 'ocean'].includes(payload.theme)
  ) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof payload.clickBehavior !== 'string' ||
    !['preview', 'new_tab'].includes(payload.clickBehavior)
  ) {
    return 'PERMISSION_DENIED';
  }
  if (payload.createdAt !== REQUEST_TIME || payload.updatedAt !== REQUEST_TIME) {
    return 'PERMISSION_DENIED';
  }

  return 'ALLOWED';
}

function evaluateAppCreate(
  auth: AuthContext | null,
  userId: string,
  appId: string,
  workspaceOwnerUid: string | null,
  payload: Record<string, unknown>
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(userId) || !isValidId(appId) || userId !== auth.uid) {
    return 'PERMISSION_DENIED';
  }
  // Master Gate check
  if (!workspaceOwnerUid || workspaceOwnerUid !== auth.uid) {
    return 'PERMISSION_DENIED';
  }

  const requiredKeys = [
    'id',
    'ownerId',
    'name',
    'url',
    'category',
    'accentColor',
    'customLogoUrl',
    'slotIndex',
    'createdAt',
    'updatedAt',
  ];
  const keys = Object.keys(payload);
  if (
    !requiredKeys.every((k) => keys.includes(k)) ||
    !keys.every((k) => requiredKeys.includes(k))
  ) {
    return 'PERMISSION_DENIED';
  }

  if (payload.id !== appId || payload.ownerId !== auth.uid || payload.ownerId !== userId) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof payload.name !== 'string' ||
    payload.name.length < 1 ||
    payload.name.length > 80
  ) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof payload.url !== 'string' ||
    payload.url.length < 4 ||
    payload.url.length > 500
  ) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof payload.slotIndex !== 'number' ||
    !Number.isInteger(payload.slotIndex) ||
    payload.slotIndex < 0 ||
    payload.slotIndex > 39
  ) {
    return 'PERMISSION_DENIED';
  }
  if (payload.createdAt !== REQUEST_TIME || payload.updatedAt !== REQUEST_TIME) {
    return 'PERMISSION_DENIED';
  }

  return 'ALLOWED';
}

test('firestore.rules file exists and contains all 8-pillar structural invariants', () => {
  const rulesText = fs.readFileSync('firestore.rules', 'utf8');
  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('allow read, write: if false;'));
  assert.ok(rulesText.includes('isValidWorkspace(incoming(), userId)'));
  assert.ok(rulesText.includes('isValidWebAppItem(incoming(), userId, appId)'));
  assert.ok(rulesText.includes('isWorkspaceMasterOwner(userId)'));
  assert.ok(rulesText.includes('affectedKeys().hasOnly('));
  assert.ok(rulesText.includes('resource.data.ownerId == request.auth.uid'));
});

test('Dirty Dozen Payloads #1-#12 all return PERMISSION_DENIED', () => {
  const validAuth: AuthContext = { uid: 'user_A', email_verified: true };
  const baseWorkspace = {
    uid: 'user_A',
    hubTitle: 'My Web Creations Hub',
    theme: 'aurora',
    clickBehavior: 'preview',
    createdAt: REQUEST_TIME,
    updatedAt: REQUEST_TIME,
  };
  const baseApp = {
    id: 'app_1',
    ownerId: 'user_A',
    name: 'Linear',
    url: 'https://linear.app',
    category: 'SaaS',
    accentColor: 'indigo',
    customLogoUrl: '',
    slotIndex: 0,
    createdAt: REQUEST_TIME,
    updatedAt: REQUEST_TIME,
  };

  // Sanity check: valid payloads pass
  assert.equal(evaluateWorkspaceCreate(validAuth, 'user_A', baseWorkspace), 'ALLOWED');
  assert.equal(evaluateAppCreate(validAuth, 'user_A', 'app_1', 'user_A', baseApp), 'ALLOWED');

  // 1. Identity Spoofing on Workspace Create
  assert.equal(
    evaluateWorkspaceCreate(validAuth, 'user_A', { ...baseWorkspace, uid: 'user_B' }),
    'PERMISSION_DENIED'
  );

  // 2. Cross-Tenant Workspace Write
  assert.equal(
    evaluateWorkspaceCreate(validAuth, 'user_B', baseWorkspace),
    'PERMISSION_DENIED'
  );

  // 3. Unverified Email Write
  assert.equal(
    evaluateWorkspaceCreate(
      { uid: 'user_A', email_verified: false },
      'user_A',
      baseWorkspace
    ),
    'PERMISSION_DENIED'
  );

  // 4. Shadow Field Injection on Workspace Create
  assert.equal(
    evaluateWorkspaceCreate(validAuth, 'user_A', { ...baseWorkspace, isAdmin: true }),
    'PERMISSION_DENIED'
  );

  // 5. Shadow Field Injection on App Create
  assert.equal(
    evaluateAppCreate(validAuth, 'user_A', 'app_1', 'user_A', {
      ...baseApp,
      ghostField: 'hacked',
    }),
    'PERMISSION_DENIED'
  );

  // 6. Value Poisoning (Invalid Theme enum)
  assert.equal(
    evaluateWorkspaceCreate(validAuth, 'user_A', {
      ...baseWorkspace,
      theme: 'invalid_neon_theme',
    }),
    'PERMISSION_DENIED'
  );

  // 7. Identity Mismatch on App Create (ownerId != auth.uid)
  assert.equal(
    evaluateAppCreate(validAuth, 'user_A', 'app_1', 'user_A', {
      ...baseApp,
      ownerId: 'user_B',
    }),
    'PERMISSION_DENIED'
  );

  // 8. Client Timestamp Forgery
  assert.equal(
    evaluateAppCreate(validAuth, 'user_A', 'app_1', 'user_A', {
      ...baseApp,
      updatedAt: '2099-01-01T00:00:00.000Z',
    }),
    'PERMISSION_DENIED'
  );

  // 9. Orphaned Subcollection Write (Master Gate missing parent workspace)
  assert.equal(
    evaluateAppCreate(validAuth, 'user_A', 'app_1', null, baseApp),
    'PERMISSION_DENIED'
  );

  // 10. Out-of-Bounds Slot Coordinate (slotIndex > 39)
  assert.equal(
    evaluateAppCreate(validAuth, 'user_A', 'app_1', 'user_A', {
      ...baseApp,
      slotIndex: 99,
    }),
    'PERMISSION_DENIED'
  );

  // 11. Path ID Poisoning (Invalid characters in appId)
  assert.equal(
    evaluateAppCreate(validAuth, 'user_A', 'bad id/with spaces', 'user_A', {
      ...baseApp,
      id: 'bad id/with spaces',
    }),
    'PERMISSION_DENIED'
  );

  // 12. Oversized String Resource Poisoning
  assert.equal(
    evaluateWorkspaceCreate(validAuth, 'user_A', {
      ...baseWorkspace,
      hubTitle: 'X'.repeat(500),
    }),
    'PERMISSION_DENIED'
  );
});
