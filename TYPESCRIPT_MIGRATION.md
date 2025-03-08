# TypeScript Migration Guide

This document provides guidance on migrating the Mockverse Backend project from JavaScript to TypeScript.

## Migration Overview

The migration to TypeScript is being implemented incrementally, allowing the application to remain functional throughout the process. The general approach follows these steps:

1. Set up TypeScript configuration
2. Migrate core utilities and common types
3. Migrate models
4. Migrate middlewares
5. Migrate controllers
6. Migrate routes
7. Migrate tests
8. Clean up by removing JavaScript files

## Migration Progress

Refer to [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for the current migration status.

## How to Complete the Migration

### Prerequisites

- Node.js 18+
- npm 9+

### Step 1: Setup Development Environment

```bash
# Install dependencies
npm install

# Run the migration script to install missing TypeScript dependencies
./scripts/migrate-to-typescript.sh
```

### Step 2: Run Tests

```bash
# Run model tests which are stable
npm run test:models

# Run all tests
npm run test
```

### Step 3: Fix Failing Tests

The migration is currently in progress, and some tests might be failing. Focus on fixing failing tests before continuing with the migration.

### Step 4: Continue Migrating Files

For each JavaScript file that needs to be migrated:

1. Create a corresponding TypeScript file with the same name but with a `.ts` extension
2. Convert the JavaScript code to TypeScript, adding proper type annotations
3. Update imports to reference the TypeScript files instead of JavaScript files
4. Run TypeScript compiler to check for errors: `npm run typecheck`
5. Once the TypeScript file is working, remove the JavaScript file

### Step 5: Build and Test

```bash
# Build the TypeScript code
npm run build

# Run the application (production)
npm start

# Or run in development mode
npm run dev
```

## Migration Tips

### Importing JavaScript Files from TypeScript

When importing JavaScript files from TypeScript files during the migration, keep the `.js` extension in the import path:

```typescript
// Correct
import { User } from '../models/user.model.js';

// Incorrect (will cause import errors in ESM)
import { User } from '../models/user.model';
```

### Type Assertions

When TypeScript cannot infer a type correctly, use type assertions:

```typescript
// Use type assertion when TypeScript cannot infer the type correctly
const user = await User.findById(id) as UserDocument;
```

### Partial Migration Strategy

During the migration process, you'll have a mix of JavaScript and TypeScript files. Use the following strategy:

1. Start with models and utilities, which are the foundation of the application
2. Then move to middlewares, which typically handle requests
3. Then controllers, which contain business logic
4. Finally, routes, which tie everything together

### Testing

Ensure tests are working at each step of the migration. The TypeScript migration should not change the functionality of the application.

## Common Issues and Solutions

### ESM and TypeScript

This project uses ESM modules. When working with TypeScript and ESM, keep these points in mind:

- Use `.js` extensions in import statements even for TypeScript files
- Use `"type": "module"` in package.json
- Use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` in tsconfig.json

### Type Definitions for Third-Party Libraries

If a library doesn't have TypeScript types, install the appropriate `@types` package:

```bash
npm install --save-dev @types/library-name
```

If no type definitions are available, create a declaration file:

```typescript
// Create a src/types/declarations.d.ts file
declare module 'library-name';
```

## Recommended Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Express with TypeScript](https://expressjs.com/en/advanced/typescript.html)
- [Mongoose with TypeScript](https://mongoosejs.com/docs/typescript.html) 