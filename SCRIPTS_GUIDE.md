# Package Scripts Reference

Quick reference for common development workflows.

## 🚀 Development

```bash
npm run dev
# Start development server on http://localhost:3000
```

## 🔨 Building

```bash
npm run build
# Build for production

npm run start
# Start production server (after build)
```

## ✅ Type & Code Quality

### Quick Type Check
```bash
npm run typecheck
# OR
npm run types:check
# Run TypeScript compiler to check for type errors (no build)
```

### Update Database Types
```bash
npm run types:generate
# OR
npm run db:types
# Generate TypeScript types from your cloud Supabase database
```

### Generate & Verify Types
```bash
npm run types:update
# Generate types from database AND run typecheck
# Use this after schema changes to ensure everything still works
```

### Full Code Validation
```bash
npm run validate
# OR
npm run check
# Runs lint + typecheck
# Perfect before committing or pushing
```

## 📝 Linting

```bash
npm run lint
# Run ESLint to check code style and catch issues
```

## 🧪 Testing

```bash
npm run test
# Run Jest unit tests

npm run e2e
# Run Playwright end-to-end tests
```

---

## 🎯 Common Workflows

### After Changing Database Schema
```bash
# 1. Generate fresh types from your database
npm run types:update

# 2. If types changed, fix any TypeScript errors
# 3. Commit the changes
git add lib/types/database.ts
git commit -m "chore: update database types"
```

### Before Committing Code
```bash
# Run full validation
npm run check

# If all passes, you're good to commit!
git add .
git commit -m "your commit message"
```

### Before Deploying
```bash
# Full validation + build
npm run check && npm run build

# If successful, deploy
git push origin main
```

### Working with Local Database
```bash
# Generate types from local Supabase instance
npm run types:generate-local

# Then check if everything compiles
npm run typecheck
```

---

## 📋 Complete Script List

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `start` | Start production server |
| `lint` | Run ESLint |
| `typecheck` | Check TypeScript types |
| `types:check` | Alias for typecheck |
| `types:generate` | Generate types from cloud DB |
| `types:generate-local` | Generate types from local DB |
| `types:update` | Generate types + verify with typecheck |
| `db:types` | Short alias for types:generate |
| `validate` | Run lint + typecheck |
| `check` | Alias for validate |
| `test` | Run Jest tests |
| `e2e` | Run Playwright tests |

---

## 💡 Pro Tips

### Set up Git Hooks
Add a pre-commit hook to automatically validate code:

```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run check
```

### VSCode Tasks
Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate Code",
      "type": "npm",
      "script": "check",
      "problemMatcher": ["$tsc", "$eslint-stylish"]
    }
  ]
}
```

### Quick Aliases
Add to your shell config (`~/.zshrc` or `~/.bashrc`):
```bash
alias nrv="npm run validate"
alias nrt="npm run types:update"
alias nrd="npm run dev"
```

---

**Remember:** Run `npm run types:update` after any database schema changes!

