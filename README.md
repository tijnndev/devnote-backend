# devnote-backend

Backend API server for DevNote application.

## Prerequisites

- Node.js >= 18.17.0
- npm >= 9.8.0

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=file:./devnote.db
API_KEY=your-secure-api-key-here
```

3. Generate Prisma Client and run migrations:
```bash
npm run prisma:migrate
```

## Development

```bash
npm run dev
```

## Production Deployment

### Important: Prisma Client Generation

The Prisma Client must be generated before the application can run. This happens automatically during:
- `npm install` (via postinstall script)
- `npm run build` (included in build script)

If you encounter the error: `"Cannot read properties of undefined (reading 'findUnique')"`, it means the Prisma Client wasn't generated. Run:

```bash
npx prisma generate
```

### Build and Run

```bash
# Build the application
npm run build

# Run database migrations
npx prisma migrate deploy

# Start the server
npm start
```

### Environment Variables (Production)

Ensure these are set in your production environment:
- `NODE_ENV=production`
- `PORT` - Server port (default: 4000)
- `DATABASE_URL` - Database connection string
- `API_KEY` - Optional API key for authentication (min 16 characters)
- `SYNC_WEBHOOK_URL` - Optional webhook URL for sync events

## Database

This project uses Prisma ORM with SQLite by default.

### Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio
npm run prisma:studio
```

## Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### "Cannot read properties of undefined (reading 'findUnique')"

This error occurs when Prisma Client is not generated. Solutions:

1. **During development:**
   ```bash
   npx prisma generate
   ```

2. **During deployment:**
   - Ensure `npm install` completes successfully (runs postinstall)
   - Ensure `npm run build` is executed (includes prisma generate)
   - Verify `@prisma/client` is in dependencies (not devDependencies)

3. **Check your DATABASE_URL:**
   - Ensure the DATABASE_URL environment variable is set correctly
   - For SQLite: `file:./devnote.db`
   - For PostgreSQL: `postgresql://user:password@host:port/database`

### Database Connection Issues

- Verify DATABASE_URL is correctly set
- Ensure database file/server is accessible
- Check file permissions for SQLite databases
