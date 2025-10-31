"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

interface GeneratedPostCardProps {
  content: string
}

/**
 * Displays the generated LinkedIn post (Agent 2 output)
 * Clean card with copy functionality
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-border shadow-premium">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Your Post</h3>
              <p className="text-sm text-muted-foreground">
                Generated based on your preferences
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Post content */}
          <div className="rounded-lg bg-muted/30 p-6 border border-border">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
              {content}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
