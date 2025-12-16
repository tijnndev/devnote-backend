# Fix and Deploy Steps

## 1. Stop All Running Processes
- Stop your dev server (Ctrl+C in all terminals)
- Close VS Code if needed to release file locks

## 2. Regenerate Prisma Client
```bash
cd c:\Development\Projects\devnote\devnote-backend
npx prisma generate
```

## 3. Create Migration (Important!)
The schema changes need to be applied to your database:
```bash
npx prisma migrate dev --name add_defaults_and_unique_constraints
```

This will:
- Add default values for `createdAt` fields
- Make `pageId` unique in `pagecontent`
- Make `clientId` unique in `syncstate`

## 4. Rebuild
```bash
npm run build
```

## 5. Test Locally
```bash
npm run dev
```

Try creating and saving content to verify it works.

## 6. Commit and Push
```bash
git add .
git commit -m "Fix: Add Prisma defaults and unique constraints"
git push
```

## 7. Apply Migration on Hosting
Your hosting provider needs to run the migration. You have two options:

### Option A: Automatic (if configured)
Most platforms run migrations automatically if you have a build script.

### Option B: Manual
Connect to your database and run:
```sql
-- This will be in the migration file created in step 3
-- Check: prisma/migrations/[timestamp]_add_defaults_and_unique_constraints/migration.sql
```

## Summary of Changes Made:

### Prisma Schema (`schema.prisma`):
1. Added `@default(dbgenerated("(UNIX_TIMESTAMP() * 1000)"))` to all `BigInt createdAt` fields
2. Made `pagecontent.pageId` `@unique` (to allow deletion by pageId)
3. Made `syncstate.clientId` `@unique @db.VarChar(255)` (to allow upsert by clientId)

### Service Code (`noteService.ts`):
1. Fixed `PageGetPayload` → `pageGetPayload` (lowercase)
2. Fixed `FolderGetPayload` → `folderGetPayload` (lowercase)
3. Fixed `fetchChanges` to use string comparison instead of Date
4. Fixed `upsertSyncState` to use `toISOString()` for lastSyncedAt

### Route Files (already done):
1. Added `.js` extension to all `serialize` imports ✅
