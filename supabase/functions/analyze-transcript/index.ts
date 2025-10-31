// Supabase Edge Function: analyze-transcript
// Analyzes Google Meet transcripts to extract customer content preferences

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// The 5 static LinkedIn posts (reference content)
const REFERENCE_POSTS = [
  {
    id: 1,
    title: "B2B GTM Playbook",
    content: `The B2B GTM Playbook Every Founder Needs

Most B2B companies fail because they don't have a clear go-to-market strategy.

Here's the complete playbook we use at Workflows.io:

1. Content Marketing (Months 1-6)
   • Start with educational blog posts
   • Build SEO authority in your niche
   • Repurpose content across LinkedIn, Twitter
   • Goal: 10K monthly organic visitors

2. Paid Advertising (Months 4-12)
   • LinkedIn Ads for decision-makers
   • Google Ads for high-intent keywords
   • Retargeting campaigns
   • Goal: $50 CAC or lower

3. Outbound Sales (Months 6-18)
   • Build targeted prospect lists
   • Multi-channel outreach (email, LinkedIn, phone)
   • Personalized messaging at scale
   • Goal: 20% response rate

4. Strategic Partnerships (Months 12-24)
   • Identify complementary products
   • Co-marketing initiatives
   • Integration partnerships
   • Goal: 30% of new revenue from partners

The key is sequencing. Don't try to do everything at once.

Start with content, add paid ads, layer in outbound, then build partnerships.

[Includes a graph showing revenue growth across these channels over 24 months]`,
    characteristics: [
      "Long-form educational content",
      "Framework-driven and structured",
      "Operational and tactical",
      "Heavy use of bullets and numbered lists",
      "Data-driven with metrics and timelines",
      "Professional, consultant-like tone",
      "Includes visual data (graph)"
    ]
  },
  {
    id: 2,
    title: "Content Journey Story",
    content: `How I grew from 0 to 27K followers 📈

0️⃣ Started posting randomly
• No strategy
• Barely any engagement
• Felt like shouting into the void

1️⃣ Studied what worked
• Read top creators daily
• Noticed patterns
• Saved posts that resonated

2️⃣ Stopped trying to sell
• Started teaching instead
• Shared actual value
• Trusted the algorithm

3️⃣ Made it visual
• Added images to every post
• Used emojis strategically
• Created infographics

The result?
→ 27K engaged followers
→ 50+ inbound leads per month
→ $500K in new revenue

You don't need to be perfect.
You just need to be consistent and valuable.

[Animated image showing follower growth curve]`,
    characteristics: [
      "Personal narrative and storytelling",
      "Conversational and motivational tone",
      "Liberal use of emojis",
      "Numbered journey structure",
      "Short, punchy sentences",
      "Focuses on results and transformation",
      "Warm and encouraging voice",
      "Visual content (animated image)"
    ]
  },
  {
    id: 3,
    title: "SaaS Retention",
    content: `SaaS companies lose 40% of customers in the first 6 months.

Here's why: Month 6 is the churn inflection point.

Our data from analyzing 200+ B2B SaaS companies shows:
• Month 1-3: 15% churn (onboarding issues)
• Month 4-6: 25% churn (value realization gap)
• Month 7-12: 10% churn (competitive switching)

The month 6 cliff is real.

What works to prevent it:
1. Heavy discount at month 5 (15-20% off annual plan)
2. Executive check-in calls at month 4
3. Advanced feature training at month 3
4. Extend trial period for hesitant users

The math: Reducing month 6 churn by just 10% → 30% increase in LTV.

Don't wait for renewal season. The battle is won in months 3-5.`,
    characteristics: [
      "Data-driven and analytical",
      "Short, direct opening hook",
      "Heavy use of statistics and metrics",
      "Problem → solution structure",
      "Consultant/expert positioning",
      "Tactical recommendations",
      "Professional and authoritative tone",
      "No emojis or visual fluff"
    ]
  },
  {
    id: 4,
    title: "Focus & Productivity",
    content: `I cut 85% of my task list.

Revenue doubled.

Here's what I kept:

→ Writing content
→ Talking to customers
→ Shipping product

Everything else was noise.

Meetings? Cut.
Reports? Cut.
"Strategy sessions"? Cut.

The trap: Busy work feels productive.

The truth: Only 3 things move the needle.

Find your 3.
Cut the rest.

Most founders are drowning in tasks that don't matter.

Link to the writing system I use (45,000+ people use it): [link]`,
    characteristics: [
      "Minimalist and punchy",
      "Very short sentences",
      "Tight rhythm and pacing",
      "Aspirational and motivational",
      "Direct, no-BS tone",
      "Focuses on elimination and focus",
      "Includes a subtle CTA with social proof"
    ]
  },
  {
    id: 5,
    title: "Case Study Lead Gen",
    content: `Case Study: How we helped a $100M+ ARR SaaS company increase SQLs by 15%

The Problem:
Their blog was getting 200K visitors/month, but conversion rate was only 0.8%.

What We Did:
✅ Redesigned CTAs with urgency language
✅ Added exit-intent popups with lead magnets
✅ Built comparison pages targeting bottom-funnel keywords
✅ Implemented retargeting sequences

The Results:
• Conversion rate: 0.8% → 2.1%
• SQLs increased by 15%
• Pipeline grew by $4.2M in 6 months
• ROI: 8.3x

The most impactful change? Comparison pages.

They targeted prospects already evaluating solutions. We created:
→ "[Their Product] vs Competitor A"
→ "[Their Product] vs Competitor B"
→ "Best alternatives to [Competitor]"

These pages converted at 6.2% (vs 0.8% site average).

Want the full case study? Comment "CASE STUDY" and I'll send it over.

[Professional image: Graph showing conversion rate improvement]`,
    characteristics: [
      "Case study format with clear structure",
      "Professional and corporate tone",
      "Heavy use of metrics and results",
      "Credibility through scale ($100M+ ARR)",
      "Mix of storytelling and data",
      "Clear problem → solution → results flow",
      "Strong CTA for engagement",
      "Visual element (graph)",
      "Growth marketing / consultant positioning"
    ]
  }
]

const SYSTEM_PROMPT = `You are analyzing a transcript where a customer reacts to 5 different LinkedIn post styles.

Your output will be fed to another LLM that writes posts for this customer. The downstream LLM has NO CONTEXT about the 5 reference posts you're seeing.

CRITICAL RULES:
- NEVER mention "Post 1", "Post 2", etc. The downstream LLM doesn't know what those are.
- Instead, describe the actual STYLE CHARACTERISTICS that resonated or were rejected
- Use OBJECTIVE, SPECIFIC language. Avoid vague terms like "LinkedIn guru style" or "typical"
- Be CONCISE. Only include facts that help another LLM write better content
- NO speculation - only extract what the customer explicitly said

Extract these preference signals:

LIKED STYLES:
- Describe the actual style elements they appreciated (e.g., "short paragraphs with line breaks", "data-driven with specific metrics", "personal storytelling with emojis")

REJECTED STYLES:
- Describe the actual style elements they disliked (e.g., "long numbered lists without commentary", "corporate formal tone", "excessive white space")

TONE:
- Be specific: not "professional" but "formal third-person" or "casual first-person"
- Use examples: "conversational like talking to a friend" vs "analytical consultant tone"

FORMAT:
- Concrete details: "300-500 words", "3-5 bullet points max", "one visual per post"
- Structure: "hook + insight + takeaway" vs "problem-solution-results"

CONTENT TYPE:
- Specific topics they want or avoid
- Balance preferences: "60% educational, 40% personal story" or "data must support narrative"

HARD NOS:
- Specific things to NEVER do (e.g., "no engagement bait CTAs", "no emoji overuse", "no posts over 500 words")

Keep it under 200 words total. Only actionable facts.`

function getPostsContext(): string {
  return REFERENCE_POSTS.map(post =>
    `POST ${post.id}: ${post.title}\n\n${post.content}\n\nCharacteristics: ${post.characteristics.join(', ')}`
  ).join('\n\n---\n\n')
}

interface RequestBody {
  transcript: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Parse request body
    const { transcript }: RequestBody = await req.json()

    // Validate input
    if (!transcript || typeof transcript !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Transcript is required and must be a string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    if (transcript.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Transcript is too short. Please provide a meaningful conversation transcript.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    if (transcript.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Transcript is too long. Please provide a transcript under 50,000 characters.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    // Check OpenAI API key
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error. Please contact support.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    // Get posts context
    const postsContext = getPostsContext()

    // Construct user message
    const userMessage = `Here are the 5 LinkedIn posts that were shown to the customer:

${postsContext}

---

Here is the Google Meet transcript of the customer's feedback on these posts:

${transcript}

---

Please analyze this transcript and provide a structured preference profile following the format specified in your system prompt.`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)

      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to analyze transcript. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const summary = openaiData.choices?.[0]?.message?.content?.trim()

    if (!summary) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate summary. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    // Save to Supabase (non-blocking)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        await supabase
          .from('transcripts')
          .insert({
            transcript_text: transcript,
            preference_summary: summary,
          })
      } catch (err) {
        console.error('Failed to save to Supabase (non-blocking):', err)
        // Don't fail the request if Supabase save fails
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ summary }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    )
  }
})
