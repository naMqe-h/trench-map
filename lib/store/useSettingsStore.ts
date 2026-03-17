import { create } from 'zustand'

export type VegetationDensity = 'high' | 'medium' | 'low'
export type AOQuality = 'quality' | 'performance' | 'off'
export type TimeOfDayMode = 'system' | 'day' | 'night'

interface SettingsState {
    postProcessingEnabled: boolean
    vegetationDensity: VegetationDensity
    dpr: number
    aoQuality: AOQuality
    renderGrassAndFlowers: boolean
    timeOfDayMode: TimeOfDayMode

    setPostProcessingEnabled: (enabled: boolean) => void
    setVegetationDensity: (density: VegetationDensity) => void
    setDpr: (dpr: number) => void
    setAoQuality: (quality: AOQuality) => void
    setRenderGrassAndFlowers: (enabled: boolean) => void
    setTimeOfDayMode: (mode: TimeOfDayMode) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
    postProcessingEnabled: true,
    vegetationDensity: 'low',
    dpr: 1.5,
    aoQuality: 'performance',
    renderGrassAndFlowers: false,
    timeOfDayMode: 'system',

    setPostProcessingEnabled: (enabled) => set({ postProcessingEnabled: enabled }),
    setVegetationDensity: (density) => set({ vegetationDensity: density }),
    setDpr: (dpr) => set({ dpr }),
    setAoQuality: (quality) => set({ aoQuality: quality }),
    setRenderGrassAndFlowers: (enabled) => set({ renderGrassAndFlowers: enabled }),
    setTimeOfDayMode: (mode) => set({ timeOfDayMode: mode }),
}))
