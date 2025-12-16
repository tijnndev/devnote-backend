# Deployment Checklist

## Pre-Deployment

- [ ] All environment variables are configured
- [ ] DATABASE_URL is set correctly for production
- [ ] API_KEY is set (minimum 16 characters)
- [ ] NODE_ENV=production

## Build Process

Run these commands in order:

```bash
# 1. Install dependencies (includes Prisma Client generation via postinstall)
npm install

# 2. Build TypeScript
npm run build

# 3. Apply database migrations
npx prisma migrate deploy
```

## Verify Deployment

After deployment, verify these items:

```bash
# 1. Check Prisma Client was generated
ls -la node_modules/.prisma/client

# 2. Check build output exists
ls -la dist/

# 3. Test health endpoint
curl http://localhost:4000/health
```

## Common Issues

### Prisma Client Not Generated

**Symptom:** Error: `Cannot read properties of undefined (reading 'findUnique')`

**Solutions:**
1. Run `npx prisma generate` manually
2. Ensure `npm install` completed successfully
3. Check that `@prisma/client` is in dependencies (not devDependencies)
4. Verify DATABASE_URL is set before running install/build

### Database Migration Failed

**Symptom:** `ensureDatabase()` throws an error

**Solutions:**
1. Verify DATABASE_URL is correct
2. Ensure database is accessible
3. Check database permissions
4. For SQLite: ensure the directory for the database file exists and is writable

## Platform-Specific Notes

### Docker

```dockerfile
# Ensure Prisma Client generation in Dockerfile
RUN npm ci
RUN npx prisma generate
RUN npm run build
```

### Vercel/Netlify/Cloud Platforms

Add to build command:
```bash
npm install && npx prisma generate && npm run build
```

### PM2/Process Managers

```json
{
  "apps": [{
    "name": "devnote-backend",
    "script": "dist/server.js",
    "env": {
      "NODE_ENV": "production",
      "DATABASE_URL": "file:./devnote.db"
    }
  }]
}
```
