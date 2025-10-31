# Supabase Edge Function Deployment Guide

This guide explains how to deploy all three Virio edge functions to Supabase:
- **Agent 1**: `analyze-transcript` - Extracts customer preferences from transcripts
- **Agent 2**: `generate-post` - Generates LinkedIn posts based on preferences
- **Agent 3**: `iterate-post` - Iterates on posts based on user feedback

## Prerequisites

1. **Supabase Account**: You need an active Supabase project
2. **Supabase CLI**: Install the Supabase CLI locally
3. **OpenAI API Key**: Required for GPT-4o integration

## Installation

### 1. Install Supabase CLI

#### macOS (via Homebrew)
```bash
brew install supabase/tap/supabase
```

#### macOS/Linux (via NPM)
```bash
npm install -g supabase
```

#### Windows (via Scoop)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Verify Installation

```bash
supabase --version
```

## Local Development

### 1. Link Your Supabase Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

You'll be prompted to enter your database password.

### 2. Configure Environment Variables

Edit `supabase/.env` with your actual values:

```env
OPENAI_API_KEY=sk-your-actual-openai-key
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

**To find your service role key:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the `service_role` key (⚠️ Never expose this publicly!)

### 3. Start Local Supabase

```bash
supabase start
```

This will start:
- Database
- Auth
- Storage
- Edge Functions runtime
- Studio (local dashboard at http://localhost:54323)

### 4. Serve Edge Functions Locally

#### Serve all functions:
```bash
supabase functions serve --env-file supabase/.env
```

#### Or serve individual functions:
```bash
# Agent 1 - Analyze Transcript
supabase functions serve analyze-transcript --env-file supabase/.env

# Agent 2 - Generate Post
supabase functions serve generate-post --env-file supabase/.env

# Agent 3 - Iterate Post
supabase functions serve iterate-post --env-file supabase/.env
```

Your functions will be available at:
```
http://localhost:54321/functions/v1/analyze-transcript
http://localhost:54321/functions/v1/generate-post
http://localhost:54321/functions/v1/iterate-post
```

### 5. Test Locally

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-transcript' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"transcript":"Engineer: Here are 5 posts. Customer: I like post 2, it feels conversational and warm. Post 1 is too formal for me."}'
```

## Production Deployment

### 1. Set Production Secrets

Before deploying, set your edge function secrets in Supabase:

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key

# Set Supabase URL
supabase secrets set SUPABASE_URL=https://gbpspxknidhqrcedgnfk.supabase.co

# Set Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

**Verify secrets:**
```bash
supabase secrets list
```

### 2. Deploy Edge Functions

#### Deploy all functions at once:
```bash
supabase functions deploy analyze-transcript
supabase functions deploy generate-post
supabase functions deploy iterate-post
```

#### Or deploy individually as needed:
```bash
# Agent 1 - Analyze Transcript
supabase functions deploy analyze-transcript

# Agent 2 - Generate Post
supabase functions deploy generate-post

# Agent 3 - Iterate Post
supabase functions deploy iterate-post
```

This will:
- Bundle your function code
- Upload it to Supabase
- Make them available at:
  - `https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-transcript`
  - `https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-post`
  - `https://YOUR_PROJECT_ID.supabase.co/functions/v1/iterate-post`

### 3. Verify Deployment

Test the deployed function:

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-transcript' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"transcript":"Engineer: Here are 5 posts. Customer: I like post 2, it feels conversational and warm. Post 1 is too formal for me."}'
```

Expected response:
```json
{
  "summary": "PREFERENCE PROFILE\n\nRESONANT POSTS:\n..."
}
```

## Monitoring

### View Logs

```bash
supabase functions logs analyze-transcript
```

For real-time logs:
```bash
supabase functions logs analyze-transcript --follow
```

### View in Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Edge Functions**
4. Click on `analyze-transcript`
5. View:
   - Invocations
   - Errors
   - Logs
   - Metrics

## Updating Functions

After making changes to any function:

```bash
# Deploy updated version of specific function
supabase functions deploy analyze-transcript  # Or generate-post, iterate-post

# Or redeploy all functions
supabase functions deploy analyze-transcript && \
supabase functions deploy generate-post && \
supabase functions deploy iterate-post
```

## Troubleshooting

### Function Not Found (404)

**Solution:**
```bash
# Redeploy the function
supabase functions deploy analyze-transcript
```

### Authorization Error

**Issue:** Missing or invalid authorization header

**Solution:**
- Ensure you're passing the correct `Authorization: Bearer {ANON_KEY}` header
- Verify your anon key in Supabase Dashboard → Settings → API

### OpenAI API Error

**Issue:** OpenAI rate limits or invalid API key

**Solution:**
```bash
# Update your OpenAI key
supabase secrets set OPENAI_API_KEY=sk-your-new-key

# Redeploy
supabase functions deploy analyze-transcript
```

### CORS Errors

**Issue:** CORS blocking requests from your frontend

**Solution:**
The function includes CORS headers. If issues persist:
1. Check that `Access-Control-Allow-Origin` is set to `*` or your specific domain
2. Verify OPTIONS requests are handled properly

### Database Connection Error

**Issue:** Can't save to Supabase database

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` secret is set correctly
2. Check that the `transcripts` table exists (run `supabase-schema.sql`)
3. Verify RLS policies allow the service role to insert

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | https://platform.openai.com/api-keys |
| `SUPABASE_URL` | Your Supabase project URL | Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (⚠️ sensitive) | Dashboard → Settings → API → service_role key |

## Cost Considerations

### Edge Function Costs
- **Free tier**: 500K function invocations/month
- **Pro tier**: 2M invocations/month included
- **Overage**: $2 per 1M invocations

### OpenAI Costs (via your function)
- **GPT-4o**: ~$0.01-0.02 per transcript analysis
- Monitor usage at https://platform.openai.com/usage

## Security Best Practices

1. ✅ **Never commit secrets** - Use `supabase secrets` CLI
2. ✅ **Use service role key** - For database operations in edge functions
3. ✅ **Validate inputs** - Function already includes validation
4. ✅ **Monitor logs** - Watch for unusual activity
5. ✅ **Rate limiting** - Consider implementing rate limits for production

## Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Quick Reference

```bash
# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy all functions
supabase functions deploy analyze-transcript
supabase functions deploy generate-post
supabase functions deploy iterate-post

# View logs (all functions)
supabase functions logs analyze-transcript --follow
supabase functions logs generate-post --follow
supabase functions logs iterate-post --follow

# Test locally (all functions)
supabase functions serve --env-file supabase/.env

# Run database migrations
# Copy SQL from supabase-schema.sql and run in Supabase Dashboard → SQL Editor
```
