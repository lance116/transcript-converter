"use client"

import { useAppStore } from "@/store/appStore"
import { StepFlow } from "@/components/StepFlow"
import { TranscriptInput } from "@/components/TranscriptInput"
import { PreferenceSummary } from "@/components/PreferenceSummary"
import { GeneratedPostCard } from "@/components/GeneratedPostCard"
import { ChatIterator } from "@/components/ChatIterator"
import { NavigationControls } from "@/components/NavigationControls"
import { EmptyState } from "@/components/EmptyState"
import { PremiumLoadingState } from "@/components/PremiumLoadingState"
import { FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  const handleContinue = () => {
    setCurrentStep(2)
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
        <PreferenceSummary summary={preferenceSummary} />
      )}

      {/* Navigation */}
      {!preferenceSummary && (
        <NavigationControls
          onNext={handleAnalyze}
          nextLabel="Analyze Transcript"
          nextDisabled={!isValid}
          isLoading={isLoading}
          showBack={false}
        />
      )}

      {preferenceSummary && !isLoading && (
        <NavigationControls
          onNext={handleContinue}
          nextLabel="Continue to Generate Post"
          nextDisabled={false}
          isLoading={false}
          showBack={false}
        />
      )}
    </div>
  )
}

/**
 * Step 2: Generate Post & Iterate
 * User generates post → Agent 2 creates post → Chat with Agent 3 to iterate
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

  const handleGeneratePost = async () => {
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
            transcriptId: "demo-transcript-id", // In production, this would be the actual transcript ID
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

  const handleBack = () => {
    setCurrentStep(1)
  }

  return (
    <div>
      {/* Empty State (before generation) */}
      {!generatedPost && !isLoading && (
        <>
          <EmptyState
            title="Ready to generate your post"
            description="We'll create a LinkedIn post based on your preferences, written in Lance's voice"
            icon={<Sparkles className="h-16 w-16 text-foreground" />}
          />
          <div className="flex justify-center mt-8">
            <Button onClick={handleGeneratePost} size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Post
            </Button>
          </div>
        </>
      )}

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

      {/* Generated Post */}
      {generatedPost && !isLoading && (
        <>
          <GeneratedPostCard content={generatedPost} />
          <ChatIterator />
        </>
      )}

      {/* Back Button */}
      {!generatedPost && (
        <NavigationControls
          onBack={handleBack}
          nextLabel=""
          nextDisabled={true}
          isLoading={false}
          showBack={true}
        />
      )}

      {generatedPost && (
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
