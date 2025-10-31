"use client"

import { useState } from "react"
import { InputSection } from "@/components/InputSection"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ResultCard } from "@/components/ResultCard"
import type { SummarizeResponse } from "@/lib/types"

export default function Home() {
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setSummary(null)

    try {
      // Call Supabase Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing")
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ transcript }),
      })

      const data: SummarizeResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze transcript")
      }

      setSummary(data.summary)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Error submitting transcript:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Preference Summarizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze customer content preferences from Google Meet transcripts
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <InputSection
            transcript={transcript}
            setTranscript={setTranscript}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Results Display */}
        {summary && !isLoading && (
          <div className="mt-8">
            <ResultCard summary={summary} />
          </div>
        )}

        {/* Instructions Footer */}
        {!summary && !isLoading && (
          <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Paste the Google Meet transcript where you showed the customer 5 LinkedIn posts</li>
              <li>Click &ldquo;Generate Summary&rdquo; to analyze their feedback</li>
              <li>Receive an objective, structured preference profile</li>
              <li>Use the summary to generate personalized LinkedIn content</li>
            </ol>
          </div>
        )}
      </div>
    </main>
  )
}
