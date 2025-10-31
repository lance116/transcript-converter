# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PreferenceSummarizer** is a tool for content agencies/engineers who create personalized LinkedIn content for clients.

**The Problem**: Every client has different content preferences (tone, format, style, topics). Content engineers need to understand what resonates with each client before creating personalized posts.

**The Solution**: This app analyzes Google Meet transcripts where an engineer shows a client 5 different LinkedIn post styles and asks "which do you like?" The AI extracts the client's preferences and outputs a structured summary that can be fed into another LLM to generate content matching that client's taste.

**Key Workflow**:
1. Content engineer shows client 5 LinkedIn posts (long-form, casual, data-driven, minimalist, case-study)
2. Engineer records the client's feedback in Google Meet
3. Engineer pastes transcript into this app
4. AI returns: "Client prefers conversational tone, dislikes overly formal posts, wants visual elements, etc."
5. Engineer uses this summary to generate personalized LinkedIn posts for the client

**Output Format**: The summary is deliberately objective and structured (not marketing fluff) because it's meant for LLM consumption, not human reading.

### Core Architecture

This is a **split-stack application**:
- **Frontend**: Next.js 14 (App Router) deployed to Vercel
- **Backend**: Supabase Edge Function (Deno runtime) deployed to Supabase
- **Database**: Supabase PostgreSQL

**Critical**: The AI processing happens in a Supabase Edge Function, NOT in a Next.js API route. The frontend makes direct HTTP calls to `https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-transcript`.

### Key Architectural Decisions

1. **Static Reference Posts**: The 5 LinkedIn posts are permanently embedded in `supabase/functions/analyze-transcript/index.ts` (lines 10-170). They are NOT fetched dynamically. If you need to modify them, you must update the edge function and redeploy.

2. **Edge Function vs API Route**: The legacy Next.js API route at `app/api/summarize/route.ts` exists but is NOT used. All AI processing flows through the Supabase Edge Function for global distribution, scalability, and security.

3. **Dual Environment Files**:
   - `.env.local` → Next.js frontend (needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `supabase/.env` → Edge function local testing (needs `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)

4. **Non-blocking Database Writes**: The edge function saves transcripts to Supabase asynchronously. If Supabase save fails, the request succeeds anyway and logs the error.

## Development Commands

### Frontend Development

```bash
# Install dependencies
npm install

# Run dev server (Next.js)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Edge Function Development

```bash
# Install Supabase CLI (first time only)
brew install supabase/tap/supabase  # macOS
# OR: npm install -g supabase

# Link to Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# Serve edge function locally (requires supabase/.env configured)
supabase functions serve analyze-transcript --env-file supabase/.env

# Test local edge function
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-transcript' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"transcript":"Engineer: Here are 5 posts. Customer: I like post 2."}'

# Deploy edge function to production
supabase functions deploy analyze-transcript

# View edge function logs
supabase functions logs analyze-transcript --follow

# Set production secrets (required before first deploy)
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Database Operations

```bash
# Run schema migration (in Supabase SQL Editor)
# Copy/paste contents of supabase-schema.sql

# Or use CLI to push schema
supabase db push
```

## Data Flow

1. User submits transcript via `app/page.tsx`
2. Frontend calls `fetch(${SUPABASE_URL}/functions/v1/analyze-transcript)` with Authorization header
3. Edge function (`supabase/functions/analyze-transcript/index.ts`):
   - Validates transcript (50-50,000 chars)
   - Injects 5 static posts as context
   - Calls OpenAI GPT-4o with system prompt
   - Saves to Supabase `transcripts` table (non-blocking)
   - Returns structured preference profile
4. Frontend displays result in `ResultCard.tsx` with copy-to-clipboard

## Critical Files

- **`supabase/functions/analyze-transcript/index.ts`**: The entire backend logic. Contains posts, prompts, OpenAI integration, validation, and Supabase writes.
- **`app/page.tsx`**: Frontend orchestration. Makes edge function call, not API route.
- **`lib/types.ts`**: Shared TypeScript interfaces between frontend and edge function.
- **`supabase-schema.sql`**: Database schema. Must be manually run in Supabase SQL Editor.
- **`EDGE_FUNCTION_DEPLOYMENT.md`**: Comprehensive deployment guide with troubleshooting.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Edge Function (Supabase secrets)
```
OPENAI_API_KEY=sk-xxx
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Note**: Edge function secrets are managed via `supabase secrets set`, NOT in `.env.local`.

## Making Changes

### Modifying the AI Prompt
Edit `SYSTEM_PROMPT` in `supabase/functions/analyze-transcript/index.ts` → redeploy edge function.

### Changing Reference Posts
Edit `REFERENCE_POSTS` array in `supabase/functions/analyze-transcript/index.ts` → redeploy edge function.

**Important**: The posts in `constants/posts.ts` are NOT used by the current implementation. They exist for reference only.

### Adjusting AI Parameters
Edit temperature/max_tokens in the OpenAI API call in `supabase/functions/analyze-transcript/index.ts` → redeploy.

### Adding UI Components
Use shadcn/ui components from `components/ui/`. Add new components to `components/`. Follow the pattern of `InputSection.tsx`, `ResultCard.tsx`, and `LoadingSpinner.tsx`.

## Common Pitfalls

1. **TypeScript errors in supabase/**: The `supabase/` folder uses Deno, not Node.js. It's excluded from `tsconfig.json`. Don't try to import Deno edge function code into Next.js files.

2. **Forgetting to redeploy**: Changes to the edge function require `supabase functions deploy analyze-transcript` to take effect. Local changes won't reflect in production until deployed.

3. **Using wrong API endpoint**: The frontend must call the Supabase edge function URL, not `/api/summarize`. The Next.js API route is legacy/unused.

4. **Missing service role key**: The edge function needs `SUPABASE_SERVICE_ROLE_KEY` (not anon key) to write to the database. Find it in Supabase Dashboard → Settings → API.

5. **CORS issues**: Edge function includes CORS headers. If you see CORS errors, verify the OPTIONS handler is working in `supabase/functions/analyze-transcript/index.ts`.

## Testing

### Manual Frontend Test
1. `npm run dev`
2. Visit http://localhost:3000
3. Paste a transcript (50+ chars)
4. Click "Generate Summary"
5. Verify structured output appears

### Manual Edge Function Test
```bash
# Local
supabase functions serve analyze-transcript --env-file supabase/.env
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-transcript' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"transcript":"Engineer: Here are the posts. Customer: I like post 2, it feels warm and conversational. Post 1 is too formal."}'

# Production
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-transcript' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"transcript":"Engineer: Here are the posts. Customer: I like post 2."}'
```

Expected response: `{"summary":"PREFERENCE PROFILE\n\nRESONANT POSTS:\n..."}`

## Deployment

### Frontend (Vercel)
```bash
vercel
# OR: git push to main (auto-deploys if GitHub integration enabled)
```

### Edge Function (Supabase)
```bash
supabase functions deploy analyze-transcript
```

### Database Schema
Run `supabase-schema.sql` in Supabase SQL Editor (manual step, required once).

## Project-Specific Conventions

- **UI Components**: All client components use `"use client"` directive at top. Server components don't need it.
- **Styling**: Use Tailwind utility classes + shadcn/ui components. No custom CSS files except `globals.css`.
- **Icons**: Use `lucide-react` for icons (already includes Copy, Check, etc.).
- **Animations**: Use Framer Motion for transitions. See `LoadingSpinner.tsx` and `ResultCard.tsx` for examples.
- **Error Handling**: Display user-friendly messages, log technical details to console.

## Repository Info

- **Repo**: https://github.com/lance116/transcript-converter.git
- **Supabase Project ID**: YOUR_PROJECT_ID
- **Deployment**: Vercel (frontend) + Supabase (backend)
