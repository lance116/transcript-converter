# virio

ai that learns your linkedin taste, then writes posts in your voice.

## what it does

paste a transcript where you react to 5 sample posts. it figures out what you like. then it generates posts that match your style + uses your real background (work, projects, etc) as content.

no more endless revisions. no more generic AI slop.

## how it works

**3 agents:**

1. **agent 1** - reads your transcript, extracts preferences (tone, format, style, what to avoid)
2. **agent 2** - generates a linkedin post matching your preferences using your background as content
3. **agent 3** - lets you chat to iterate/refine the post

**the flow:**

1. paste google meet transcript → get preference summary
2. click generate → get a post tailored to you
3. chat to refine it → keep iterating until it's perfect

## setup

```bash
npm install
cp .env.example .env.local
# edit .env.local with your keys
npm run dev
```

**deploy edge functions:**

```bash
supabase link --project-ref YOUR_PROJECT_ID
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase functions deploy analyze-transcript
supabase functions deploy generate-post
supabase functions deploy iterate-post
```

**setup database:**

run the sql in `supabase-schema.sql` in your supabase dashboard.

## stack

- next.js 14 + typescript
- supabase edge functions (deno)
- gpt-4o
- framer motion
- tailwind + shadcn

## files

- `/app/page.tsx` - main 2-step ui
- `/components/*` - ui components (step flow, chat, etc)
- `/store/appStore.ts` - zustand state management
- `/supabase/functions/` - 3 edge functions (agents)
- `supabase-schema.sql` - db tables

## how agents work

**agent 1** (`analyze-transcript`):
- input: transcript of you reacting to 5 posts
- output: structured preference summary
- temp: 0.3 (objective)

**agent 2** (`generate-post`):
- input: preference summary + your hardcoded background context
- output: linkedin post (300-500 words)
- temp: 0.7 (creative)
- knows current oct 2025 industry news, your work history, target audience

**agent 3** (`iterate-post`):
- input: current post + your edit request
- output: revised post
- temp: 0.7

## customizing agent 2

edit `/supabase/functions/generate-post/index.ts` to update:
- your background (age, work history, etc)
- target audience (who you want to attract)
- current industry context (gets stale, update periodically)

then redeploy:
```bash
supabase functions deploy generate-post
```

