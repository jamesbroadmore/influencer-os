# Security Specification: creatorledger Firestore Security Rules

## 1. Data Invariants
- **Private User Isolation**: User profiles (`/users/{userId}`) and their subcollections can only be read and written by the authenticated user whose `request.auth.uid == userId`.
- **Identity Integrity**: Incoming user updates and creations cannot forge ownership (`request.auth.uid` must match `incoming().id` on creation).
- **Subcollection Ownership**: Chat messages in `/users/{userId}/chat_messages/{messageId}` require `request.auth.uid == userId` and `incoming().userId == request.auth.uid`.
- **Default Deny**: All unspecified paths are closed to all reads and writes.

## 2. The "Dirty Dozen" Payloads (Designed to Fail)
1. Unauthenticated read to `/users/user_abc123` -> REJECTED (Missing auth)
2. Unauthenticated write to `/users/user_abc123` -> REJECTED (Missing auth)
3. Authenticated user A attempting to read `/users/user_B` -> REJECTED (UID mismatch)
4. Authenticated user A attempting to write `/users/user_B` -> REJECTED (UID mismatch)
5. User attempting to forge another user's ID in `/users/{userId}` payload -> REJECTED (Id mismatch)
6. User attempting to create chat message under another user's subcollection -> REJECTED (Parent path UID mismatch)
7. User attempting to forge `userId` inside a chat message document -> REJECTED (Validation helper mismatch)
8. User attempting to write oversized payload (>100KB strings) -> REJECTED (String size boundary check)
9. Malicious path injection with invalid ID characters -> REJECTED (`isValidId` regex guard)
10. Unauthenticated list of all users -> REJECTED (Catch-all deny)
11. Querying chat messages without scoping to own `userId` -> REJECTED (Query enforcer)
12. Attempting to tamper with non-existent system collections -> REJECTED (Default deny)

## 3. Verification
All rules are tested against these invariants with strict zero-trust ABAC policies.
