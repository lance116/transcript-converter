"use client"

import { motion } from "framer-motion"

interface StepIndicatorProps {
  currentStep: 1 | 2
  totalSteps: 2
}

/**
 * Visual step progress indicator
 * Vercel-inspired minimal design
 */
export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="font-mono">Step {currentStep} of {totalSteps}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-1.5 rounded-full ${
              index + 1 === currentStep
                ? "bg-foreground w-8"
                : index + 1 < currentStep
                ? "bg-muted-foreground w-6"
                : "bg-border w-6"
            }`}
            initial={{ width: 24 }}
            animate={{
              width: index + 1 === currentStep ? 32 : 24,
              opacity: index + 1 <= currentStep ? 1 : 0.5,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  )
}
