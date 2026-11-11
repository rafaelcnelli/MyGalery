# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Workspace Ownership Invariant**: A `/workspaces/{userId}` document can only be read, created, updated, or deleted by an authenticated user with a verified email (`request.auth.token.email_verified == true` for writes) whose `request.auth.uid == userId` AND whose payload `uid == request.auth.uid`.
2. **Master Gate Relational Invariant**: A `/workspaces/{userId}/apps/{appId}` document cannot exist or be modified unless the parent document `/workspaces/{userId}` exists and its `uid == request.auth.uid`.
3. **Slot Coordinate Bounds Invariant**: `slotIndex` on `WebAppItem` must be an `int` strictly within `[0, 39]`.
4. **Strict Key & Size Bounds Invariant**: No shadow fields are permitted on `create` or `update`. Every string field has an explicit `.size() <= maxLength` bound matching `firebase-blueprint.json`.
5. **Temporal & Identity Immutability Invariant**: `uid`, `ownerId`, `id`, and `createdAt` are immutable after creation; `createdAt` must equal `request.time` on creation and `updatedAt` must equal `request.time` on creation and update.
6. **Zero PII Storage**: Neither `UserWorkspace` nor `WebAppItem` stores user emails, phone numbers, or physical addresses.

---

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing on Workspace Create**: Authenticated user `user_A` attempts to create `/workspaces/user_A` with `{ uid: "user_B", ... }`. -> `PERMISSION_DENIED`
2. **Cross-Tenant Workspace Read**: Authenticated user `user_A` attempts `get` on `/workspaces/user_B`. -> `PERMISSION_DENIED`
3. **Unverified Email Write**: Authenticated user `user_A` with `email_verified: false` attempts to create `/workspaces/user_A`. -> `PERMISSION_DENIED`
4. **Shadow Field Injection on Create**: Payload includes `{ ..., isAdmin: true }` not in `hasOnly` allowlist. -> `PERMISSION_DENIED`
5. **Shadow Field Injection on Update (Update-Gap)**: User updates `hubTitle` along with an undeclared field `{ hubTitle: "New", hacked: 1 }`. -> `PERMISSION_DENIED`
6. **Value Poisoning on Update**: User updates `theme` to `"invalid_theme"` or a 10KB string. -> `PERMISSION_DENIED`
7. **Immortal Field Mutation**: User attempts to change `createdAt` or `ownerId` during an update on `/workspaces/user_A/apps/app_1`. -> `PERMISSION_DENIED`
8. **Client Timestamp Forgery**: User supplies a forged past/future timestamp for `updatedAt` instead of `request.time`. -> `PERMISSION_DENIED`
9. **Orphaned Subcollection Write**: User `user_A` attempts to create `/workspaces/user_A/apps/app_1` before `/workspaces/user_A` exists. -> `PERMISSION_DENIED`
10. **Out-of-Bounds Slot Coordinate**: User attempts to create or update an app with `slotIndex: 99` or `slotIndex: -1`. -> `PERMISSION_DENIED`
11. **Path ID Poisoning**: User attempts to create a document with an invalid ID containing spaces or special characters or > 128 chars. -> `PERMISSION_DENIED`
12. **Unauthorized List Scraping**: User `user_A` attempts `list` on `/workspaces/user_B/apps`. -> `PERMISSION_DENIED`

---

## 3. Red Team Audit & Conflict Report

- **Collection `/workspaces/{userId}`**:
  - *Identity Spoofing*: Blocked by `userId == request.auth.uid && data.uid == request.auth.uid` and `incoming().uid == existing().uid`.
  - *Resource Poisoning*: Blocked by `isValidId(userId)` and strict `.size()` bounds on `hubTitle` (1..80), `theme` (enum), `clickBehavior` (enum).
  - *Value Poisoning*: Blocked because `isValidWorkspace(incoming())` wraps the entire `allow update` expression alongside `affectedKeys().hasOnly(...)`.
- **Collection `/workspaces/{userId}/apps/{appId}`**:
  - *Identity Spoofing*: Blocked by `userId == request.auth.uid && data.ownerId == request.auth.uid && data.id == appId` and immutable `ownerId`/`id` checks on update.
  - *Master Gate*: Enforced via `isWorkspaceOwner(userId)` checking `get(/databases/$(database)/documents/workspaces/$(userId)).data.uid == request.auth.uid`.
  - *Query Trust Test (`allow list`)*: Enforced via `isSignedIn() && userId == request.auth.uid && resource.data.ownerId == request.auth.uid` with zero `get()`/`exists()` calls inside `allow list`.
