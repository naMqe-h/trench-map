import { create } from 'zustand'

interface PerformanceState {
    fps: number
    fpsHistory: number[]
}

interface PerformanceActions {
    updatePerformanceMetrics: (fps: number) => void
}

const initialState: PerformanceState = {
    fps: 0,
    fpsHistory: [],
}

export const usePerformanceStore = create<PerformanceState & PerformanceActions>((set) => ({
    ...initialState,

    updatePerformanceMetrics: (fps) =>
        set((state) => ({
            fps,
            fpsHistory: [...state.fpsHistory.slice(-99), fps],
        })),
}))
