# Preference Summarizer

If you're creating LinkedIn content for clients, you know every client has different preferences. Some want long-form educational posts, others prefer short punchy updates. Some like emojis and casual tone, others want data-driven corporate speak.

This app helps you figure out what each client actually wants.

## What it does

Show your client 5 different LinkedIn post styles. Record the conversation where they tell you what they like and don't like. Paste the transcript here. Get back a clear summary of their preferences that you can use to generate content they'll actually approve.

The summary is designed to be fed into another AI (like ChatGPT or Claude) to generate posts that match your client's taste. No more endless revision cycles.

### What you get

The app analyzes your Google Meet transcript and gives you things like:

- Which post styles resonated (and which didn't)
- Tone preferences (formal vs casual, technical vs storytelling)
- Format preferences (length, structure, use of data/visuals)
- Hard constraints ("never use emojis" or "always include metrics")
- A synthesized profile you can hand to an LLM

It uses 5 fixed reference posts covering different styles: a long B2B playbook, a personal growth story with emojis, a data-heavy SaaS analysis, a minimalist productivity post, and a professional case study. These are baked into the app, so every client reacts to the same baseline.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animation**: Framer Motion
- **AI**: OpenAI GPT-4o
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Frontend) + Supabase (Edge Functions)

## Project Structure

```
/app
  /api
    /summarize/route.ts       # (Legacy) Next.js API route - not used
  layout.tsx                   # Root layout with Inter font
  page.tsx                     # Main application page (calls Edge Function)
  globals.css                  # Global styles and CSS variables

/components
  /ui                          # shadcn/ui base components
    button.tsx
    card.tsx
    textarea.tsx
    label.tsx
  InputSection.tsx             # Transcript input component
  ResultCard.tsx               # Summary display with copy-to-clipboard
  LoadingSpinner.tsx           # Animated loading indicator

/constants
  posts.ts                     # 5 static LinkedIn posts (reference content)

/lib
  openai.ts                    # OpenAI client and system prompt
  supabase.ts                  # Supabase client and data functions
  types.ts                     # TypeScript interfaces
  utils.ts                     # Utility functions (cn helper)

/supabase
  /functions
    /analyze-transcript
      index.ts                 # Edge Function for AI analysis
  config.toml                  # Supabase configuration
  .env                         # Edge Function environment variables

/supabase-schema.sql           # Database migration script
/EDGE_FUNCTION_DEPLOYMENT.md   # Comprehensive deployment guide
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/lance116/transcript-converter.git
cd virio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# OpenAI API Key
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key

# Supabase Configuration
# Find these in your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set Up Supabase Database

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL to create the `transcripts` table

The schema includes:
- `transcripts` table with columns: `id`, `transcript_text`, `preference_summary`, `created_at`
- Indexes for performance
- Row Level Security (RLS) policies
- Immutable records (prevents updates/deletes)

### 5. Deploy Supabase Edge Function

**⚠️ IMPORTANT**: The app uses a Supabase Edge Function for AI processing, not a Next.js API route.

Follow the complete guide in **[EDGE_FUNCTION_DEPLOYMENT.md](./EDGE_FUNCTION_DEPLOYMENT.md)** or use this quickstart:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# OR: npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Set secrets (required for production)
supabase secrets set OPENAI_API_KEY=sk-your-actual-key
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy the edge function
supabase functions deploy analyze-transcript
```

**Verify deployment:**
```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-transcript' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"transcript":"test"}'
```

📖 **Full deployment guide**: See [EDGE_FUNCTION_DEPLOYMENT.md](./EDGE_FUNCTION_DEPLOYMENT.md) for detailed instructions, troubleshooting, and local development setup.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## How to use it

1. Paste your Google Meet transcript
2. Click "Generate Summary"
3. Get back a structured preference profile
4. Copy it and feed it into ChatGPT/Claude to generate posts

### Example transcript

```
Engineer: So I'm going to show you five different LinkedIn posts. Let me know which ones you like and why.

Customer: Okay, sounds good.

Engineer: Here's the first one - it's about B2B go-to-market strategy.

Customer: Hmm, this is really long. I like the structure and the data, but I think it's too formal for my audience. My followers prefer something more conversational.

Engineer: Got it. How about this second one - it's a personal growth story?

Customer: Oh, I love this! The emojis make it feel friendly, and the numbered format is easy to scan. This is much more my style.

[... continue with posts 3, 4, 5 ...]
```

### What the output looks like

You'll get something like this:

```
PREFERENCE PROFILE

RESONANT POSTS:
- Post 2 (Content Journey Story): Customer appreciated conversational tone...

REJECTED ELEMENTS:
- Post 1 length: Too formal and lengthy for their audience...

TONE PREFERENCES:
- Conversational over formal...

FORMAT PREFERENCES:
- Short, scannable paragraphs...

CONTENT TYPE PREFERENCES:
- Personal stories over pure tactics...

KEY CONSTRAINTS:
- Avoid overly corporate/formal language...

SYNTHESIS:
Customer prefers warm, conversational content with visual elements...
```

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lance116/transcript-converter)

### Manual Deployment

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to **Project Settings** → **Environment Variables**
   - Add `OPENAI_API_KEY`
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Redeploy after adding environment variables

### Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

## How it works

### The 5 reference posts

The app has 5 LinkedIn posts baked in that cover different styles:

1. **B2B GTM Playbook** - Long, structured, lots of bullets and data
2. **Content Journey Story** - Personal, emojis, motivational vibes
3. **SaaS Retention** - Data-heavy, analytical, consultant-speak
4. **Focus & Productivity** - Short and punchy, minimalist
5. **Case Study Lead Gen** - Professional, metrics-focused, corporate

Every client reacts to these same 5 posts, so you get consistent feedback.

### Behind the scenes

When you paste a transcript:

1. The frontend sends it to a Supabase Edge Function (not a Next.js API route)
2. The edge function injects those 5 posts as context for GPT-4o
3. GPT-4o reads the transcript and figures out what the client liked/didn't like
4. It returns a structured summary (not prose - actual sections like "RESONANT POSTS", "REJECTED ELEMENTS", etc.)
5. The app saves the transcript + summary to Supabase for your records
6. You get the summary on screen with a copy button

### Why edge functions?

We use Supabase Edge Functions instead of Next.js API routes because they're faster globally, scale automatically, keep API keys secure, and you only pay for what you use. The AI logic is completely separate from the frontend.

### The prompt

The system prompt tells GPT-4o to be objective and factual - no speculation, no fluff. Just extract what the client said and structure it for another AI to read. That's why the output looks technical rather than pretty.

## Configuration Options

### Adjusting AI Temperature

In `supabase/functions/analyze-transcript/index.ts`, you can modify the temperature:

```typescript
temperature: 0.3  // Lower = more consistent, Higher = more creative
```

After making changes, redeploy:
```bash
supabase functions deploy analyze-transcript
```

### Changing Max Output Length

```typescript
max_tokens: 2000  // Increase for longer summaries
```

After making changes, redeploy:
```bash
supabase functions deploy analyze-transcript
```

### Customizing the Reference Posts

The 5 reference posts are embedded in the edge function. To modify them:

1. Edit `supabase/functions/analyze-transcript/index.ts`
2. Update the `REFERENCE_POSTS` array (lines 10-170)
3. Redeploy: `supabase functions deploy analyze-transcript`

**Note**: The posts in `constants/posts.ts` are for reference only and not used by the current implementation.

### Modifying the Output Format

Update the `SYSTEM_PROMPT` in `supabase/functions/analyze-transcript/index.ts` to change the structure of the preference summary, then redeploy:

```bash
supabase functions deploy analyze-transcript
```

## Testing

Just paste a transcript and see if it works. The summary should have clear sections (RESONANT POSTS, REJECTED ELEMENTS, etc.). Click the copy button to make sure that works too.

To see your saved transcripts, go to your Supabase Dashboard → Table Editor → `transcripts` table.

Before deploying, test the production build locally:
```bash
npm run build
npm run start
```

## Common issues

**OpenAI errors:**
- 401? Your API key is wrong
- 429? You hit rate limits, wait a bit
- 500? OpenAI might be down

**Supabase not working:**
- Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure your Supabase project isn't paused
- Check RLS policies allow inserts/selects

**Build failing:**
- `npm install` to reinstall dependencies
- `npm run build` to see TypeScript errors
- Make sure your `.env.local` is set up

## Making changes

New components go in `/components`, use TypeScript, and try to use shadcn/ui primitives when you can.

The actual API logic is in the edge function (`supabase/functions/analyze-transcript/index.ts`), not in a Next.js API route. If you modify the edge function, you need to redeploy it with `supabase functions deploy analyze-transcript`.

## Security

Don't commit `.env.local` to git. Input is validated (transcripts must be 50-50,000 chars). Supabase uses Row Level Security on the database. Consider rate limiting if you go to production.

## What it costs

Each transcript analysis costs about $0.01-0.02 with GPT-4o. Supabase and Vercel both have free tiers that should be fine for personal/small-scale use.

## Support

For questions or issues:
- Check this README thoroughly
- Review code comments in key files
- Open an issue on GitHub: https://github.com/lance116/transcript-converter/issues

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
