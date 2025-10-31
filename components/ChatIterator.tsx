"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { motion, AnimatePresence } from "framer-motion"
import { IterationMessage } from "./IterationMessage"

/**
 * Chat interface for iterating on the generated post
 * Allows user to request revisions via Agent 3
 */
export function ChatIterator() {
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
        ? iterations[iterations.length - 1].revised_post
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
        user_message: userMessage,
        revised_post: data.revisedPost,
        created_at: new Date().toISOString(),
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8"
    >
      <div className="rounded-lg border border-border bg-background shadow-premium overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold">Refine Your Post</h3>
          <p className="text-sm text-muted-foreground">
            Chat with AI to iterate and improve the post
          </p>
        </div>

        {/* Messages area */}
        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {iterations.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                Start a conversation to refine your post
              </motion.div>
            ) : (
              iterations.map((iteration, index) => (
                <IterationMessage
                  key={iteration.id}
                  userMessage={iteration.user_message}
                  revisedPost={iteration.revised_post}
                  index={index}
                />
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border px-6 py-4">
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
              className="gap-2"
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
