"use client"

import React from "react"
import { useAppStore } from "@/store/appStore"
import { StepFlow } from "@/components/StepFlow"
import { TranscriptInput } from "@/components/TranscriptInput"
import { PreferenceSummary } from "@/components/PreferenceSummary"
import { ChatIterator } from "@/components/ChatIterator"
import { NavigationControls } from "@/components/NavigationControls"
import { PremiumLoadingState } from "@/components/PremiumLoadingState"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

/**
 * Step 1: Analyze Transcript
 * User pastes transcript → Agent 1 analyzes → Show preference summary
 */
function Step1() {
  const transcript = useAppStore((state) => state.transcript)
  const preferenceSummary = useAppStore((state) => state.preferenceSummary)
  const isLoading = useAppStore((state) => state.isLoading)
  const error = useAppStore((state) => state.error)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const setPreferenceSummary = useAppStore((state) => state.setPreferenceSummary)
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  const isValid = transcript.trim().length >= 50

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing")
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ transcript }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze transcript")
      }

      setPreferenceSummary(data.summary)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Error analyzing transcript:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Transcript Input */}
      <TranscriptInput />

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8">
          <PremiumLoadingState message="Analyzing your preferences..." />
        </div>
      )}

      {/* Preference Summary */}
      {preferenceSummary && !isLoading && (
        <>
          <div className="mt-8">
            <PreferenceSummary summary={preferenceSummary} />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setCurrentStep(2)}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Generate Post
            </Button>
          </div>
        </>
      )}

      {/* Navigation */}
      {!preferenceSummary && !isLoading && (
        <NavigationControls
          onNext={handleAnalyze}
          nextLabel="Analyze Transcript"
          nextDisabled={!isValid}
          isLoading={isLoading}
          showBack={false}
        />
      )}
    </div>
  )
}

/**
 * Step 2: Generate Post & Iterate
 * Automatically generates post on mount, then shows chat interface
 */
function Step2() {
  const preferenceSummary = useAppStore((state) => state.preferenceSummary)
  const generatedPost = useAppStore((state) => state.generatedPost)
  const isLoading = useAppStore((state) => state.isLoading)
  const error = useAppStore((state) => state.error)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const setGeneratedPost = useAppStore((state) => state.setGeneratedPost)
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  // Auto-generate post on mount
  React.useEffect(() => {
    // Only generate if we don't already have a post
    if (!generatedPost && !isLoading && preferenceSummary) {
      const generatePost = async () => {
        setIsLoading(true)
        setError(null)

        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Supabase configuration missing")
          }

          const response = await fetch(
            `${supabaseUrl}/functions/v1/generate-post`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                transcriptId: "demo-transcript-id",
                preferenceSummary,
              }),
            }
          )

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to generate post")
          }

          setGeneratedPost(data.post)
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred"
          setError(errorMessage)
          console.error("Error generating post:", err)
        } finally {
          setIsLoading(false)
        }
      }

      generatePost()
    }
  }, [generatedPost, isLoading, preferenceSummary, setGeneratedPost, setIsLoading, setError])

  const handleBack = () => {
    setCurrentStep(1)
  }

  // If post is generated, show full-height chat interface
  if (generatedPost && !isLoading) {
    return <ChatIterator initialPost={generatedPost} />
  }

  // Otherwise show loading state
  return (
    <div>
      {/* Loading State */}
      {isLoading && (
        <PremiumLoadingState message="Generating your personalized post..." />
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">Error: {error}</p>
        </div>
      )}

      {/* Back Button */}
      {!isLoading && (
        <NavigationControls
          onBack={handleBack}
          nextLabel=""
          nextDisabled={true}
          isLoading={false}
          showBack={true}
        />
      )}
    </div>
  )
}

/**
 * Main App Page
 * Orchestrates the 2-step flow
 */
export default function Home() {
  return <StepFlow step1Component={<Step1 />} step2Component={<Step2 />} />
}
