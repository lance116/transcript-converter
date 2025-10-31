import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")

interface IteratePostRequest {
  postId?: string
  currentPost: string
  userMessage: string
}

/**
 * Agent 3: Iterate on LinkedIn Post
 *
 * Takes user feedback and revises the post while maintaining Lance's voice
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
    const { postId, currentPost, userMessage }: IteratePostRequest =
      await req.json()

    if (!currentPost || !userMessage) {
      return new Response(
        JSON.stringify({ error: "currentPost and userMessage are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Call OpenAI to revise post
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
              content: `You are a LinkedIn post editor for Lance Yan. Your job is to revise an existing LinkedIn post based on user feedback.

## LANCE YAN VOICE PROFILE (MAINTAIN THIS IN ALL REVISIONS)

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

## YOUR TASK

You will receive:
1. CURRENT POST - The existing LinkedIn post
2. USER FEEDBACK - A request for changes or improvements

Your job is to:
1. Understand the user's feedback and apply it thoughtfully
2. Revise the post accordingly
3. Maintain Lance Yan's authentic voice (as described above)
4. Keep the post 300-500 words unless the user explicitly requests a different length

CRITICAL RULES:
- Output ONLY the revised post content. No meta-commentary, no "Here's the revision:", no explanation.
- This is a LINKEDIN POST, not an email or letter. Do NOT end with signatures like "Best regards", "Cheers", "Lance", or any sign-off.
- The post should end with a natural conclusion, question, or call-to-action - NOT a signature.
- If the user's request would make the post sound inauthentic to Lance, find a creative compromise.
- Make targeted changes based on the feedback - don't rewrite the entire post unless necessary.
- Preserve the core message and structure unless the user asks to change them.
- The output should be ready to publish.`,
            },
            {
              role: "user",
              content: `CURRENT POST:\n${currentPost}\n\nUSER FEEDBACK:\n${userMessage}\n\nPlease revise the post based on this feedback while maintaining Lance's voice.`,
            },
          ],
        }),
      }
    )

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error("OpenAI API error:", errorData)
      return new Response(
        JSON.stringify({ error: "Failed to revise post" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const revisedPost = openaiData.choices[0].message.content.trim()

    // Store iteration in database (optional - only if postId is provided)
    if (postId) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      )

      const { error: dbError } = await supabaseClient
        .from("iterations")
        .insert({
          post_id: postId,
          user_message: userMessage,
          revised_post: revisedPost,
        })

      if (dbError) {
        console.error("Database error:", dbError)
        // Don't fail the request if DB save fails - just log it
      }
    }

    return new Response(
      JSON.stringify({
        revisedPost,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error in iterate-post function:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})
