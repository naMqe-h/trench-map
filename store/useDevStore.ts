import { create } from 'zustand'

interface DevState {
    maxChunks: number
    wireframeMode: boolean
    freeCam: boolean
}

interface DevActions {
    setMaxChunks: (maxChunks: number) => void
    setWireframeMode: (wireframeMode: boolean) => void
    setFreeCam: (freeCam: boolean) => void
}

export const useDevStore = create<DevState & DevActions>((set) => ({
    maxChunks: 1,
    wireframeMode: false,
    freeCam: false,

    setMaxChunks: (maxChunks) => set({ maxChunks }),
    setWireframeMode: (wireframeMode) => set({ wireframeMode }),
    setFreeCam: (freeCam) => set({ freeCam }),
}))
