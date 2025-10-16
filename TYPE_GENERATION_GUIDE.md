# TypeScript Type Generation Guide

This guide shows you how to automatically generate TypeScript types from your Supabase database schema.

## Setup (One-time)

### Step 1: Get Your Project Reference

Your Supabase URL looks like: `https://YOUR_PROJECT_REF.supabase.co`

Extract the `YOUR_PROJECT_REF` part from your `NEXT_PUBLIC_SUPABASE_URL` environment variable.

For example:
- URL: `https://abcdefghijklmnop.supabase.co`
- Project Ref: `abcdefghijklmnop`

### Step 2: Login to Supabase CLI

```bash
npx supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference.

This creates a `.supabase/config.toml` file (already in `.gitignore`).

## Generating Types

### Option 1: From Your Cloud Database (Recommended)

After linking your project:

```bash
npm run types:generate
```

This generates types from your **production database** on Supabase.

### Option 2: From Local Database (Development)

If you're running Supabase locally:

```bash
npm run types:generate-local
```

This generates types from your **local Supabase instance**.

## When to Regenerate Types

Regenerate types whenever you:
- ✅ Add a new migration
- ✅ Modify a table schema
- ✅ Add/remove columns
- ✅ Change column types
- ✅ Add/modify RLS policies (functions)

## Quick Reference

```bash
# One-time setup
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# Generate types (after schema changes)
npm run types:generate

# Verify types are correct
npm run typecheck
```

## Troubleshooting

### "Not logged in"
Run: `npx supabase login`

### "Project not linked"
Run: `npx supabase link --project-ref YOUR_PROJECT_REF`

### "Cannot find project"
- Check your project ref is correct
- Make sure you're logged in to the right account
- Verify the project exists in your Supabase dashboard

### Types still incorrect after generation
- Make sure migrations are applied to your database
- Check that you're generating from the right environment (production vs local)
- Clear your TypeScript cache: `rm -rf node_modules/.cache`

## Benefits of Auto-Generated Types

✅ **Always in sync** - Types match your database exactly  
✅ **No manual maintenance** - Generate with one command  
✅ **Catches errors early** - TypeScript errors before runtime  
✅ **Better autocomplete** - IDE knows your exact schema  
✅ **Safer refactoring** - Compiler catches breaking changes  

---

**Pro Tip:** Add type generation to your CI/CD pipeline or pre-commit hooks to ensure types are always up to date!

