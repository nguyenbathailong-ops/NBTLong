# Security Spec: Surgical Template Manager

## 1. Data Invariants
- A template MUST have a `userId` that matches the authenticated user.
- A template MUST have a `procedureName`.
- `createdAt` is immutable after creation.
- `userId` is immutable after creation.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: `create` with `userId` of another user.
2. **Resource Poisoning**: `create` with a 1MB string in `procedureName`.
3. **Invalid ID**: `get` with a 2KB junk string as `templateId`.
4. **Unauthorized Read**: `get` a template belonging to another user.
5. **Unauthorized List**: `list` all templates without `userId` filter.
6. **Privilege Escalation**: `update` to change `userId` to someone else.
7. **Immutable Violation**: `update` to change `createdAt`.
8. **Shadow Field**: `create` with an extra field `isSystemAdmin: true`.
9. **Type Confusion**: `create` with `lastUsed` as a `string` instead of `number`.
10. **Array Abuse**: `create` with an `interactiveNotes` array of 10,000 items.
11. **Regex Bypass**: `create` with an ID containing shell injection characters.
12. **Status Shortcut**: (N/A for this app, but could be "approving" a report if that feature existed).

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify these. For now, I will proceed to generate the hardened rules.
