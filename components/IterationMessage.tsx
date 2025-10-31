"use client"

import { motion } from "framer-motion"
import { User, Sparkles, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface IterationMessageProps {
  userMessage: string
  revisedPost: string
  index: number
}

/**
 * Single iteration message pair (user request + AI revision)
 * Chat bubble style with copy functionality on AI responses
 */
export function IterationMessage({
  userMessage,
  revisedPost,
  index,
}: IterationMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(revisedPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* User message - right aligned */}
      <div className="flex gap-3 items-start justify-end">
        <div className="flex-1 flex justify-end">
          <div className="rounded-2xl bg-foreground text-background px-4 py-3 max-w-[75%]">
            <p className="text-sm leading-relaxed">{userMessage}</p>
          </div>
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
          <User className="h-5 w-5 text-background" />
        </div>
      </div>

      {/* AI response - left aligned */}
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="rounded-2xl bg-muted border border-border px-4 py-4 max-w-[75%]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-xs font-semibold text-primary">
                Revised Post
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs gap-1.5 -mt-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {revisedPost}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
