import { NextRequest, NextResponse } from 'next/server'
import { openai, MODEL, SYSTEM_PROMPT } from '@/lib/openai'
import { saveTranscriptAnalysis } from '@/lib/supabase'
import { getPostsContext } from '@/constants/posts'
import type { SummarizeRequest, SummarizeResponse } from '@/lib/types'

/**
 * POST /api/summarize
 *
 * Analyzes a Google Meet transcript where a customer provides feedback on 5 LinkedIn posts.
 * Returns an objective, structured summary of the customer's content preferences.
 *
 * Process:
 * 1. Validate input transcript
 * 2. Inject static posts as context
 * 3. Send to GPT-4o for analysis
 * 4. Store result in Supabase (non-blocking)
 * 5. Return structured preference profile
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: SummarizeRequest = await request.json()
    const { transcript } = body

    // Input validation
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required and must be a string' },
        { status: 400 }
      )
    }

    if (transcript.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript is too short. Please provide a meaningful conversation transcript.' },
        { status: 400 }
      )
    }

    if (transcript.length > 50000) {
      return NextResponse.json(
        { error: 'Transcript is too long. Please provide a transcript under 50,000 characters.' },
        { status: 400 }
      )
    }

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Get static posts context
    const postsContext = getPostsContext()

    // Construct user message with posts context + transcript
    const userMessage = `Here are the 5 LinkedIn posts that were shown to the customer:

${postsContext}

---

Here is the Google Meet transcript of the customer's feedback on these posts:

${transcript}

---

Please analyze this transcript and provide a structured preference profile following the format specified in your system prompt.`

    // Call OpenAI API
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3, // Lower temperature for more consistent, objective output
        max_tokens: 2000,
      })
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError)

      // Handle rate limit errors
      if (apiError.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }

      // Handle other API errors
      return NextResponse.json(
        { error: 'Failed to analyze transcript. Please try again.' },
        { status: 500 }
      )
    }

    // Extract the summary from OpenAI response
    const summary = completion.choices[0]?.message?.content?.trim()

    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to generate summary. Please try again.' },
        { status: 500 }
      )
    }

    // Save to Supabase (non-blocking, errors logged but don't block response)
    // This makes Supabase optional - app will work even if Supabase is not configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      saveTranscriptAnalysis(transcript, summary).catch(err => {
        console.error('Failed to save to Supabase (non-blocking):', err)
      })
    }

    // Return successful response
    const response: SummarizeResponse = {
      summary
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error: any) {
    console.error('Unexpected error in /api/summarize:', error)

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/summarize
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit a transcript.' },
    { status: 405 }
  )
}
