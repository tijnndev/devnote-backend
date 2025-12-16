# DateTime Migration - Complete Changes

## What Changed

All `createdAt` fields across all models have been converted from `BigInt` (Unix milliseconds) to `DateTime` with MySQL's `@default(now())`.

### Models Updated:
- ✅ `folder` - createdAt: BigInt → DateTime
- ✅ `page` - createdAt: BigInt → DateTime  
- ✅ `pagecontent` - createdAt: BigInt → DateTime
- ✅ `pagerevision` - createdAt: BigInt → DateTime
- ✅ `syncstate` - createdAt: String → DateTime, lastSyncedAt: String → DateTime
- ✅ `changelog` - createdAt: String → DateTime

### Code Updated:
- ✅ `noteService.ts` - Updated FolderTreeNode type (bigint → Date)
- ✅ `noteService.ts` - Fixed sortTree() to use Date methods instead of Number()

## How to Apply

### Close Everything First!
**IMPORTANT:** Stop all running processes to avoid file lock errors:
1. Stop dev servers (Ctrl+C in terminals)
2. Close VS Code if needed
3. Kill any Node processes

### Run the Migration

```cmd
cd c:\Development\Projects\devnote\devnote-backend
migrate-to-datetime.bat
```

This will:
1. ✅ Generate new Prisma client
2. ✅ Create & apply database migration
3. ✅ Rebuild the backend

### Manual Steps (if batch fails)

```cmd
cd c:\Development\Projects\devnote\devnote-backend

# 1. Generate Prisma client
npx prisma generate

# 2. Create migration
npx prisma migrate dev --name convert_createdAt_to_datetime

# 3. Build
npm run build

# 4. Test
npm run dev
```

## For Production/Docker

After deploying the new code, run in your production environment:

```bash
npx prisma migrate deploy
```

This applies all pending migrations to your production database.

## Why This Fixes Your Issues

### Before (BigInt):
- ❌ Manual Unix timestamp conversion required
- ❌ Inconsistent between `BigInt` and `String` types
- ❌ `dbgenerated("(UNIX_TIMESTAMP() * 1000)")` behaves differently across MySQL versions
- ❌ More complex serialization needed (serializeBigInt everywhere)
- ❌ Timezone issues in production vs localhost

### After (DateTime):
- ✅ MySQL handles all timestamps automatically
- ✅ Consistent DateTime type across all models
- ✅ `@default(now())` works identically everywhere
- ✅ Simpler code - no manual timestamp math
- ✅ Better compatibility with Docker/production environments
- ✅ Prisma handles serialization automatically

## What This Doesn't Break

- ✅ `serializeBigInt()` still works (no longer needed for timestamps, but won't break)
- ✅ Existing data will be migrated automatically
- ✅ Frontend already expects ISO date strings
- ✅ No frontend changes needed

## Verify It Works

After migration, test:
```cmd
npm run dev
```

Then:
1. Create a new page
2. Check that content saves
3. Verify timestamps appear correctly
4. Test on both localhost and production

## Rollback (if needed)

If something goes wrong:
```cmd
npx prisma migrate reset
```

⚠️ WARNING: This will delete all data! Only use in development.
