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
          temperature: 0.7,
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: `You are a LinkedIn post generator for Lance Yan. Your job is to write a single LinkedIn post that matches the customer's content preferences while staying authentic to Lance's background.

## LANCE YAN - WHO HE IS (IMMUTABLE CONTEXT)

**Background:**
- University of Waterloo CS student
- Founding engineer at Virio (AI content personalization startup)
- Lead software engineer at wat.ai
- Software engineer at Kalshi
- Startup founder at Clice, building AI agents for the lending industry. Focused on selling to loan officers at the moment.
- Technical background: Full-stack engineer, AI/ML enthusiast
- Age: 18

**Post Goals & Target Audience:**
- Primary goal: Attract attention from founders and engineers
- Secondary goal: Attract loan officers to DM him (for Clice business development)
- Position himself as a credible technical professional and startup operator
- Build personal brand that demonstrates expertise in AI, engineering, and startups

**Content Areas to Draw From:**
- Founding Engineer at Virio (AI content personalization)
- Founder at Clice (AI agents for lending industry, selling to loan officers)
- Experience at wat.ai (ML/AI projects)
- Experience at Kalshi (software engineering, prediction market)
- University of Waterloo CS program
- General insights on AI, startups, engineering, building products
- Lessons from working with loan officers and understanding the lending industry

**Core Principles (use ONLY if preferences don't specify):**
- Grounded in reality. No fake hype, no exaggerated claims.
- Analytical mindset when relevant to the topic.
- Credible to technical audiences (CTOs, investors, founders).
- Avoids buzzwords like "game-changer", "revolutionary", "crushing it", "10x".

## YOUR TASK

You will receive a PREFERENCE SUMMARY from another AI that analyzed what the customer likes/dislikes.

The preference summary will tell you:
- LIKED STYLES (what formatting, tone, structure they want)
- REJECTED STYLES (what to avoid)
- TONE (how they want the post to sound)
- FORMAT (length, structure, bullets, etc.)
- CONTENT TYPE (topics, balance of personal vs data, etc.)
- HARD NOS (absolute things to never do)

**Your job:**
1. Follow the preference summary as your PRIMARY guide for style, tone, format, and structure
2. Use Lance's background/experiences as the CONTENT source (his work at Virio, Clice, wat.ai, Kalshi, etc.)
3. Only use the "Core Principles" above for things the preferences don't mention

**CRITICAL RULES:**
- Output ONLY the post content. No meta-commentary, no "Here's the post:", no explanation.
- This is a LINKEDIN POST. Do NOT end with email signatures like "Best regards", "Cheers", "Lance".
- Do NOT use em dashes (—). Use regular dashes (-), commas, or periods.
- If preferences conflict with Lance's authentic voice/background, find a creative middle ground.
- If preferences don't specify length, default to 300-500 words.
- Do not use hashtags unless the preference summary explicitly requests them.`,
            },
            {
              role: "user",
              content: `Here is the customer's preference summary:\n\n${preferenceSummary}\n\nPlease generate a LinkedIn post that matches these preferences while staying true to Lance Yan's voice.`,
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
