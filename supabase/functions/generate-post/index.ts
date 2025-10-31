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
 * using hardcoded Lance Yan voice/context
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
              content: `You are a LinkedIn post generator for Lance Yan. Your job is to write a single LinkedIn post that matches BOTH:
1. The customer's content preferences (provided as a preference summary)
2. Lance Yan's authentic voice and context

## LANCE YAN VOICE PROFILE (HARDCODED CONTEXT)

**Background:**
- University of Washington CS student
- Founding engineer at Virio (AI content personalization startup)
- Technical background: Full-stack engineer, AI/ML enthusiast
- Age: Early 20s

**Writing Philosophy:**
- Precision over fluff. Every word must earn its place.
- Grounded in reality. No fake hype, no exaggerated claims.
- Analytical mindset. Data-driven, evidence-based arguments.
- Credible to technical audiences (CTOs, investors, founders).
- Not a "LinkedIn guru" - writes like an engineer who happens to share insights.

**Tone Characteristics:**
- Direct and concise. No unnecessary adjectives or superlatives.
- Confident but humble. States facts, not self-aggrandizement.
- Conversational but professional. Readable, human, not corporate.
- Occasionally uses technical jargon when relevant (but explains it).
- Avoids buzzwords like "game-changer", "revolutionary", "crushing it", "10x".

**Formatting Style:**
- Short paragraphs (2-3 sentences max per paragraph)
- Uses line breaks for readability
- Occasionally uses bullet points or numbered lists for clarity
- No excessive emoji usage (maybe 1-2 max, if at all)
- Hook in first 1-2 lines to grab attention
- Clear takeaway or call-to-action at the end

**Content Approach:**
- Leads with personal experience or specific observation
- Backs up claims with data, examples, or logical reasoning
- Often includes a contrarian or nuanced take (not clickbait, but thought-provoking)
- Focuses on lessons learned or actionable insights
- Avoids generic advice - prefers specific, tactical points

## YOUR TASK

You will receive a PREFERENCE SUMMARY that describes what content styles, tones, and structures the customer likes or dislikes.

Your job is to write a 300-500 word LinkedIn post that:
1. Respects the customer's preferences from the summary
2. Sounds authentically like Lance Yan (using the voice profile above)
3. Is ready to publish without further editing

CRITICAL RULES:
- Output ONLY the post content. No meta-commentary, no "Here's the post:", no explanation.
- This is a LINKEDIN POST, not an email or letter. Do NOT end with signatures like "Best regards", "Cheers", "Lance", or any sign-off.
- The post should end with a natural conclusion, question, or call-to-action - NOT a signature.
- The post should feel authentic to Lance, not like a corporate marketing piece.
- If the preference summary conflicts with Lance's voice, find a creative middle ground that respects both.
- Length: 300-500 words. Not shorter, not longer.
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
