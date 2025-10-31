"use client"

import { motion } from "framer-motion"

/**
 * Animated loading spinner component
 * Uses Framer Motion for smooth rotation animation
 */
export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Analyzing transcript...
      </motion.p>
    </div>
  )
}
