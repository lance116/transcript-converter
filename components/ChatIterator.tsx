"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { motion, AnimatePresence } from "framer-motion"
import { IterationMessage } from "./IterationMessage"
import { GeneratedPostCard } from "./GeneratedPostCard"

interface ChatIteratorProps {
  initialPost?: string
}

/**
 * Chat interface for iterating on the generated post
 * Allows user to request revisions via Agent 3
 * Shows the initial generated post at the top
 */
export function ChatIterator({ initialPost }: ChatIteratorProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const iterations = useAppStore((state) => state.iterations)
  const generatedPost = useAppStore((state) => state.generatedPost)
  const addIteration = useAppStore((state) => state.addIteration)
  const setError = useAppStore((state) => state.setError)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [iterations])

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)
    setError(null)

    try {
      // Get the current post (either original or last iteration)
      const currentPost = iterations.length > 0
        ? iterations[iterations.length - 1].revisedPost
        : generatedPost

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing")
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/iterate-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            currentPost,
            userMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to iterate: ${response.statusText}`)
      }

      const data = await response.json()

      // Add iteration to store
      addIteration({
        id: crypto.randomUUID(),
        userMessage: userMessage,
        revisedPost: data.revisedPost,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Error iterating post:", error)
      setError(error instanceof Error ? error.message : "Failed to iterate post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Messages area - takes up remaining space */}
      <div className="flex-1 overflow-y-auto">
        {/* Show initial generated post */}
        {initialPost && <GeneratedPostCard content={initialPost} />}

        {/* Show iteration messages */}
        <div className="px-4 space-y-6">
          <AnimatePresence mode="popLayout">
            {iterations.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                Ask for changes to refine your post...
              </motion.div>
            )}
            {iterations.map((iteration, index) => (
              <IterationMessage
                key={iteration.id}
                userMessage={iteration.userMessage}
                revisedPost={iteration.revisedPost}
                index={index}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for changes... (e.g., 'Make it more concise' or 'Add more data points')"
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} + Enter to send
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              size="lg"
              className="gap-2 h-[80px] shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Revising...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
