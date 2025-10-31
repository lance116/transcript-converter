"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/appStore"
import { motion } from "framer-motion"

/**
 * Premium transcript input component (Step 1)
 * Vercel-inspired minimal design with validation
 */
export function TranscriptInput() {
  const transcript = useAppStore((state) => state.transcript)
  const setTranscript = useAppStore((state) => state.setTranscript)
  const isLoading = useAppStore((state) => state.isLoading)

  const isValid = transcript.trim().length >= 50
  const charCount = transcript.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Paste your transcript
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          We&apos;ll learn what you like from your conversation about the 5 LinkedIn posts.
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-3">
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your Google Meet transcript here...

Engineer: Here are 5 posts. Let me know what you think.
Customer: The data-heavy one is good but needs more personal experience..."
          className="min-h-[400px] resize-y text-base leading-relaxed font-mono text-sm"
          disabled={isLoading}
        />

        {/* Character count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {charCount < 50 && charCount > 0 && (
              <span className="text-destructive">
                Need {50 - charCount} more characters
              </span>
            )}
          </span>
          <span className="font-mono">{charCount.toLocaleString()} characters</span>
        </div>
      </div>
    </motion.div>
  )
}
