/**
 * Represents a LinkedIn post used as reference content
 */
export interface Post {
  id: number
  title: string
  content: string
  characteristics: string[]
}

/**
 * Request payload for the summarize API endpoint
 */
export interface SummarizeRequest {
  transcript: string
}

/**
 * Response from the summarize API endpoint
 */
export interface SummarizeResponse {
  summary: string
  error?: string
}

/**
 * Database record for storing transcripts and summaries
 */
export interface TranscriptRecord {
  id?: string
  transcript_text: string
  preference_summary: string
  created_at?: string
}
