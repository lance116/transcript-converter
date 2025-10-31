"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface NavigationControlsProps {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
}

/**
 * Navigation controls for multi-step flow
 * Back and Next/Submit buttons with loading states
 */
export function NavigationControls({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  isLoading = false,
  showBack = false,
}: NavigationControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center justify-between gap-4 pt-8"
    >
      {/* Back button */}
      {showBack && onBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {/* Next/Submit button */}
      {onNext && (
        <Button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="gap-2 ml-auto"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </motion.div>
  )
}
