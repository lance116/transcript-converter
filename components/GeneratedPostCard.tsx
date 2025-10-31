"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check, Sparkles } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

interface GeneratedPostCardProps {
  content: string
}

/**
 * Displays the generated LinkedIn post (Agent 2 output)
 * Styled as the first AI message in the chat
 */
export function GeneratedPostCard({ content }: GeneratedPostCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 py-6 max-w-4xl mx-auto"
    >
      {/* AI message - left aligned */}
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="rounded-2xl bg-muted border border-border px-4 py-4 max-w-[75%]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-xs font-semibold text-primary">
                Generated Post
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
              {content}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
