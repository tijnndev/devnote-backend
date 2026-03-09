# Contributing to DevNote Backend

First off, thank you for considering contributing to DevNote! It's people like you that make DevNote such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Exercise empathy and kindness
- Give and gracefully accept constructive feedback
- Focus on what is best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what behavior you expected
- **Include screenshots** if relevant
- **Include your environment details** (Node version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** if applicable
5. **Ensure tests pass**: `npm test`
6. **Update documentation** as needed
7. **Commit your changes** with clear commit messages
8. **Push to your fork** and submit a pull request

## Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/devnote-backend.git
cd devnote-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npm run prisma:migrate

# Run development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Code Style

We use ESLint and Prettier to maintain code quality:

```bash
# Lint your code
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

**Key conventions:**
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Write self-documenting code with clear variable names
- Add JSDoc comments for public APIs
- Use Zod schemas for validation

### Database Changes

When making database changes:

1. **Update the Prisma schema** in `prisma/schema.prisma`
2. **Create a migration**: `npm run prisma:migrate`
3. **Test the migration** with both upgrade and downgrade
4. **Update seed data** if necessary

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(folders): add support for folder colors
fix(auth): resolve API key validation issue
docs(readme): update installation instructions
```

## Project Structure

```
src/
├── app.ts              # Express app setup
├── server.ts           # Server entry point
├── config.ts           # Configuration management
├── middleware/         # Express middleware
├── routes/             # API route handlers
│   ├── folders.ts
│   ├── pages.ts
│   └── ...
├── services/           # Business logic
└── lib/                # Shared utilities
```

### Adding New Endpoints

1. Create/update route file in `src/routes/`
2. Add route handler with proper validation
3. Use Zod schemas for input validation
4. Return consistent response formats
5. Add appropriate error handling
6. Write tests for the endpoint

Example:
```typescript
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional()
});

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    // Implementation
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Testing Guidelines

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should handle success case', async () => {
    // Arrange
    const input = { /* ... */ };
    
    // Act
    const result = await someFunction(input);
    
    // Assert
    expect(result).toBeDefined();
  });

  it('should handle error case', async () => {
    const input = { /* ... */ };
    await expect(someFunction(input)).rejects.toThrow();
  });
});
```

## API Design Guidelines

- Use RESTful conventions
- Return appropriate HTTP status codes
- Include proper error messages
- Version the API if making breaking changes
- Document all endpoints

**Status Codes:**
- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid API key
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

## Documentation

- Update README.md for user-facing changes
- Update inline comments for code changes
- Add JSDoc for public functions
- Update API documentation

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- The repository's contributors list
- Release notes for significant contributions
- Special mentions for major features

Thank you for contributing to DevNote! 🎉
