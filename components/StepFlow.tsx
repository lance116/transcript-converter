"use client"

import { useAppStore } from "@/store/appStore"
import { StepIndicator } from "./StepIndicator"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { RotateCcw } from "lucide-react"

interface StepFlowProps {
  step1Component: React.ReactNode
  step2Component: React.ReactNode
}

/**
 * Main 2-step flow controller with smooth transitions
 * Handles step switching with Framer Motion animations
 */
export function StepFlow({ step1Component, step2Component }: StepFlowProps) {
  const currentStep = useAppStore((state) => state.currentStep)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with step indicator */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/virioai_logo.jpeg"
              alt="Virio AI"
              width={32}
              height={32}
              className="rounded"
            />
            <h1 className="text-xl font-semibold tracking-tight">Virio</h1>
          </div>
          <div className="flex items-center gap-4">
            <StepIndicator currentStep={currentStep} totalSteps={2} />
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Session
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area with animated step transitions */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="py-12 overflow-y-auto"
            >
              <div className="container mx-auto px-4 max-w-4xl">
                {step1Component}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {step2Component}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs text-muted-foreground text-center">
            Learn your taste. Write like you.
          </p>
        </div>
      </footer>
    </div>
  )
}
