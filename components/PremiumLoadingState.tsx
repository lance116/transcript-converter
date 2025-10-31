"use client"

import { motion } from "framer-motion"

interface PremiumLoadingStateProps {
  message?: string
  showProgress?: boolean
}

/**
 * Premium loading state with optional progress bar
 * Vercel-inspired minimal animation
 */
export function PremiumLoadingState({
  message = "Loading...",
  showProgress = false
}: PremiumLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-foreground rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Loading message */}
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </motion.p>

      {/* Optional progress bar */}
      {showProgress && (
        <motion.div
          className="w-full max-w-xs h-0.5 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </motion.div>
      )}
    </div>
  )
}
