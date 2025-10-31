"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ResultCardProps {
  summary: string
}

/**
 * Result card component displaying the preference summary
 * Includes copy-to-clipboard functionality with visual feedback
 */
export function ResultCard({ summary }: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Customer Preference Summary</CardTitle>
              <CardDescription className="mt-2">
                This summary is optimized for LLM consumption. Use it to generate personalized content.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {summary}
            </pre>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
