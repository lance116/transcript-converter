import { createClient } from '@supabase/supabase-js'
import type { TranscriptRecord } from './types'

/**
 * Initialize Supabase client with environment variables
 * Used for storing transcript analysis results
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Save a transcript and its preference summary to Supabase
 * @param transcript - The raw Google Meet transcript
 * @param summary - The AI-generated preference summary
 * @returns The created record or null if failed
 */
export async function saveTranscriptAnalysis(
  transcript: string,
  summary: string
): Promise<TranscriptRecord | null> {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .insert({
        transcript_text: transcript,
        preference_summary: summary,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving to Supabase:', error)
      return null
    }

    return data as TranscriptRecord
  } catch (err) {
    console.error('Unexpected error saving to Supabase:', err)
    return null
  }
}

/**
 * Retrieve all transcript analyses, ordered by most recent first
 * @param limit - Maximum number of records to retrieve
 * @returns Array of transcript records
 */
export async function getTranscriptHistory(
  limit: number = 10
): Promise<TranscriptRecord[]> {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching from Supabase:', error)
      return []
    }

    return data as TranscriptRecord[]
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err)
    return []
  }
}
