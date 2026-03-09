# DevNote Backend

A powerful, self-hosted note-taking backend API built with Express, TypeScript, and Prisma. DevNote provides a robust REST API for managing hierarchical notes, folders, and rich content including documents and Excalidraw canvases.

## ✨ Features

- 📝 **Rich Text Support** - Store HTML, JSON, and plain text content
- 🎨 **Excalidraw Integration** - Canvas-based drawing and diagramming
- 📁 **Hierarchical Folders** - Organize notes with nested folder structures
- 🔍 **Full-Text Search** - Fast search across all your notes
- 🔄 **Real-time Sync** - Built-in sync state management for multiple clients
- 📊 **Revision History** - Track changes with automatic page revisions
- 🔐 **API Key Authentication** - Secure your API with token-based auth
- 🚀 **Production Ready** - Built with TypeScript, Prisma, and best practices

## 🛠️ Tech Stack

- **Node.js** (v18.17.0+)
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **MySQL** - Primary database
- **Zod** - Schema validation
- **Pino** - Structured logging
- **Vitest** - Testing framework

## 📋 Prerequisites

- Node.js >= 18.17.0
- npm >= 9.8.0
- MySQL database (or compatible database)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/tijnndev/devnote-backend.git
cd devnote-backend
npm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=8037
DATABASE_URL="mysql://user:password@localhost:3306/devnote"
API_KEY=your_secret_api_key_minimum_16_chars
SYNC_WEBHOOK_URL=http://localhost:4000/api/sync  # Optional
```

**Security Note:** Generate a secure random API key (32+ characters recommended):

```bash
# Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prepare

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8037`

## 📚 API Documentation

### Authentication

All API requests (except `/health`) require an API key header:

```http
x-api-key: your_secret_api_key
```

### Endpoints

#### Health Check
```http
GET /health
```

#### Folders
```http
GET    /api/folders              # List all folders
POST   /api/folders              # Create folder
GET    /api/folders/:id          # Get folder by ID
PATCH  /api/folders/:id          # Update folder
DELETE /api/folders/:id          # Delete folder
```

#### Pages (Notes)
```http
GET    /api/pages                # List all pages
POST   /api/pages                # Create page
GET    /api/pages/:id            # Get page by ID
PATCH  /api/pages/:id            # Update page
DELETE /api/pages/:id            # Delete page
```

#### Sections (Page Content)
```http
GET    /api/sections/:pageId     # Get page content
POST   /api/sections             # Create/update content
```

#### Search
```http
GET    /api/search?q=query       # Search across all pages
```

#### Sync
```http
POST   /api/sync                 # Sync changes
GET    /api/sync/changes         # Get changelog
```

### Example Request

```bash
curl -X GET http://localhost:8037/api/pages \
  -H "x-api-key: your_secret_api_key" \
  -H "Content-Type: application/json"
```

## 🏗️ Project Structure

```
devnote-backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── src/
│   ├── app.ts             # Express app configuration
│   ├── server.ts          # Server entry point
│   ├── config.ts          # Environment configuration
│   ├── logger.ts          # Logging setup
│   ├── middleware/        # Express middleware
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   ├── lib/               # Utilities
│   └── test/              # Test files
├── .env.example           # Example environment file
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

Tests use an in-memory SQLite database for fast execution.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run prepare      # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

### Database Schema

The database consists of:
- **folders** - Hierarchical folder structure
- **pages** - Individual notes/pages
- **pagecontent** - Rich content (HTML, JSON, Canvas)
- **pagerevision** - Version history
- **syncstate** - Client sync tracking
- **changelog** - Change history for sync

## 🚢 Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Set Production Environment

```env
NODE_ENV=production
PORT=8037
DATABASE_URL="mysql://user:password@host:3306/devnote"
API_KEY=very_secure_random_key_at_least_32_characters
```

### 3. Run Database Migrations

```bash
npx prisma migrate deploy
```

### 4. Start the Server

```bash
npm start
```

### Using Process Manager (PM2)

```bash
npm install -g pm2
pm2 start dist/server.js --name devnote-backend
pm2 save
pm2 startup
```

## 🔒 Security Best Practices

1. **Always use HTTPS** in production
2. **Use strong API keys** (32+ random characters)
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Use environment variables** - Never commit secrets
5. **Enable rate limiting** - Consider adding rate limiting middleware
6. **Database backups** - Regular automated backups
7. **Monitor logs** - Set up log monitoring and alerts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- None currently reported

## 📮 Support

- Create an issue for bug reports or feature requests
- Check existing issues before creating new ones

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- TypeScript for type safety

## 🔗 Related Projects

- [DevNote Frontend](https://github.com/tijnndev/devnote-frontend) - React frontend for DevNote
