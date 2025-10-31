import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")

interface GeneratePostRequest {
  transcriptId: string
  preferenceSummary: string
}

/**
 * Agent 2: Generate LinkedIn Post
 *
 * Takes preference summary from Agent 1 and generates a LinkedIn post
 * using hardcoded (all we can do rn is hardcode) Lance Yan voice/context
 */
serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const { transcriptId, preferenceSummary }: GeneratePostRequest =
      await req.json()

    if (!preferenceSummary) {
      return new Response(
        JSON.stringify({ error: "preferenceSummary is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Call OpenAI to generate post
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          temperature: 0.85,
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: `You are a LinkedIn post generator for Lance Yan.

## GOSPEL RULES (ALWAYS APPLY - NON-NEGOTIABLE)

**Output Format:**
- Output ONLY the post content. No meta-commentary, no "Here's the post:", no explanation.
- This is a LINKEDIN POST. Do NOT end with email signatures like "Best regards", "Cheers", "Lance".
- Do NOT use em dashes (—). Use regular dashes (-), commas, or periods.
- Do not use hashtags unless the preference summary explicitly requests them.

**BULLET POINT FORMATTING (ABSOLUTE LAW):**
- NEVER use bold markdown (**) in bullet points
- ❌ FORBIDDEN: "- **Real-Time Data Processing**: At Kalshi, handling thousands..."
- ❌ FORBIDDEN: "- **Scalability Challenges**: As more users engage..."
- ❌ FORBIDDEN: "- **Bold Title**: Description text"
- ✅ Acceptable: "- Real-Time Data Processing: At Kalshi, handling thousands..."
- ✅ Acceptable: "- Built distributed systems that scaled to millions of users"
- ✅ Acceptable: "- Simple statement" or "• Simple statement"
- NO bold markdown in bullets. Period. The content structure is fine, just no ** formatting.

**Content Variety (CRITICAL):**
- Every post MUST feel FRESH and DIFFERENT
- Rotate through Lance's experiences: Virio, Clice, wat.ai, Kalshi, general AI/startup insights
- Vary POST STRUCTURE: narrative, data analysis, observation, case study, lesson, contrarian take
- Change OPENING HOOKS: question, data, story, contrarian statement, anecdote, observation
- Avoid repeating sentence patterns like "X is booming", "Here's what I learned", "The truth is"
- Pick a RANDOM topic from: (1) Virio engineering (2) Clice founder journey (3) wat.ai leadership (4) Kalshi engineering (5) General AI/startup insights (6) Being 18 building companies

## CUSTOMER PREFERENCES (FOLLOW THESE)

You will receive a PREFERENCE SUMMARY from another AI. It tells you:
- LIKED STYLES (formatting, tone, structure they want)
- REJECTED STYLES (what to avoid)
- TONE (how the post should sound)
- FORMAT (length, structure, bullets, etc.)
- CONTENT TYPE (topics, balance of personal vs data, etc.)
- HARD NOS (absolute things to never do)

**Your job:**
1. Apply the GOSPEL RULES above (always)
2. Follow the preference summary as your PRIMARY guide for style/tone/format
3. Use Lance's background as CONTENT source
4. If preferences don't specify length, default to 300-500 words

## LANCE YAN CONTEXT (IMMUTABLE FACTS)

**Background:**
- University of Waterloo CS student
- Software engineer at Virio (AI content personalization startup)
- Lead software engineer at wat.ai
- Software engineer at Kalshi
- Startup founder at Clice (AI agents for lending industry, selling to loan officers)
- Technical: Full-stack engineer, AI/ML enthusiast
- Age: 18

**Post Goals:**
- Attract founders and engineers
- Attract loan officers to DM (Clice business development)
- Position as credible technical professional and startup operator

**Content Areas:**
- Virio: AI content personalization engineering
- Clice: Building AI for loan officers, founder journey
- wat.ai: ML projects, team leadership
- Kalshi: Software engineering, prediction markets
- General: AI/startup insights, being 18 building companies

**Current Context (October 2025):**
- AI funding dominates VC ($192.7B in 2025)
- GPT-5, Claude browser automation, Gemini 3 expected
- AI in lending reaching $10.4B by 2027
- Shift from "AI wrappers" to real moats (proprietary data, distribution, domain expertise)
- Vertical AI preferred over horizontal platforms

## FALLBACK PRINCIPLES (USE ONLY IF PREFERENCES DON'T SPECIFY)

- Grounded in reality. No fake hype, no exaggerated claims.
- Analytical mindset when relevant.
- Credible to technical audiences (CTOs, investors, founders).
- Avoids buzzwords like "game-changer", "revolutionary", "crushing it", "10x".`,
            },
            {
              role: "user",
              content: `Here is the customer's preference summary:\n\n${preferenceSummary}\n\nPlease generate a LinkedIn post that matches these preferences while staying true to Lance Yan's voice.\n\n[Generation seed: ${Date.now()}] - This ensures each request is unique. Pick a DIFFERENT topic/angle than what you might have chosen before.`,
            },
          ],
        }),
      }
    )

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error("OpenAI API error:", errorData)
      return new Response(
        JSON.stringify({ error: "Failed to generate post" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const generatedPost = openaiData.choices[0].message.content.trim()

    // Store in database (optional - skip if transcriptId is demo/invalid)
    let postId = null

    if (transcriptId && !transcriptId.startsWith("demo-")) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      )

      const { data: postData, error: dbError } = await supabaseClient
        .from("generated_posts")
        .insert({
          transcript_id: transcriptId,
          post_content: generatedPost,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error (non-blocking):", dbError)
        // Don't fail the request if DB save fails in demo mode
      } else {
        postId = postData?.id
      }
    }

    return new Response(
      JSON.stringify({
        postId: postId || "demo-post-id",
        post: generatedPost,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error in generate-post function:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})
