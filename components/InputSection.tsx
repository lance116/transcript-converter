"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface InputSectionProps {
  transcript: string
  setTranscript: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

/**
 * Input section component for pasting and submitting transcripts
 * Includes client-side validation and disabled states
 */
export function InputSection({ transcript, setTranscript, onSubmit, isLoading }: InputSectionProps) {
  const isValidInput = transcript.trim().length >= 50

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidInput && !isLoading) {
      onSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="transcript" className="text-base">
          Paste your Google Meet transcript here
        </Label>
        <Textarea
          id="transcript"
          placeholder="Paste the conversation transcript where you showed the customer the 5 LinkedIn posts and gathered their feedback..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="min-h-[300px] resize-y"
          disabled={isLoading}
        />
        {transcript.length > 0 && transcript.trim().length < 50 && (
          <p className="text-sm text-destructive">
            Transcript must be at least 50 characters long
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isValidInput || isLoading}
        className="w-full transition-all duration-200"
      >
        {isLoading ? "Analyzing..." : "Generate Summary"}
      </Button>
    </form>
  )
}
