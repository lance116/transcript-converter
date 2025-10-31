import { create } from 'zustand'

export interface Iteration {
  id: string
  userMessage: string
  revisedPost: string
  timestamp: number
}

interface AppState {
  // Current step in the flow
  currentStep: 1 | 2
  setCurrentStep: (step: 1 | 2) => void

  // Step 1: Transcript Analysis
  transcript: string
  setTranscript: (transcript: string) => void
  preferenceSummary: string | null
  setPreferenceSummary: (summary: string | null) => void

  // Step 2: Post Generation
  generatedPost: string | null
  setGeneratedPost: (post: string | null) => void

  // Iterations
  iterations: Iteration[]
  addIteration: (iteration: Iteration) => void
  clearIterations: () => void

  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Actions
  reset: () => void
  goToStep: (step: 1 | 2) => void
}

const initialState = {
  currentStep: 1 as 1 | 2,
  transcript: '',
  preferenceSummary: null,
  generatedPost: null,
  iterations: [],
  isLoading: false,
  error: null,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  setTranscript: (transcript) => set({ transcript }),

  setPreferenceSummary: (summary) => set({ preferenceSummary: summary }),

  setGeneratedPost: (post) => set({ generatedPost: post }),

  addIteration: (iteration) =>
    set((state) => ({ iterations: [...state.iterations, iteration] })),

  clearIterations: () => set({ iterations: [] }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error: error }),

  reset: () => set(initialState),

  goToStep: (step) => set({ currentStep: step, error: null }),
}))
