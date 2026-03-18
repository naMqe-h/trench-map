import { create } from 'zustand'
import { getPerformanceTier } from '../lib/hardwareDetection'

export type VegetationDensity = 'high' | 'medium' | 'low'
export type AOQuality = 'quality' | 'performance' | 'off'
export type TimeOfDayMode = 'system' | 'day' | 'night'
export type ShadowQuality = 'high' | 'low' | 'off'

const presets = {
    high: {
        postProcessingEnabled: true,
        dpr: 1.5,
        aoQuality: 'quality' as AOQuality,
        shadowQuality: 'high' as ShadowQuality,
        loadDistance: 20,
        renderGrassAndFlowers: true,
    },
    medium: {
        postProcessingEnabled: true,
        dpr: 1.0,
        aoQuality: 'performance' as AOQuality,
        shadowQuality: 'low' as ShadowQuality,
        loadDistance: 12,
        renderGrassAndFlowers: false,
    },
    low: {
        postProcessingEnabled: false,
        dpr: 1.0,
        aoQuality: 'off' as AOQuality,
        shadowQuality: 'off' as ShadowQuality,
        loadDistance: 8,
        renderGrassAndFlowers: false,
    },
}

type Preset = 'high' | 'medium' | 'low' | 'custom'

interface SettingsState {
    isHardwareDetected: boolean
    activePreset: Preset
    postProcessingEnabled: boolean
    vegetationDensity: VegetationDensity
    dpr: number
    aoQuality: AOQuality
    renderGrassAndFlowers: boolean
    timeOfDayMode: TimeOfDayMode
    shadowQuality: ShadowQuality
    loadDistance: number
    cameraDamping: number

    setPostProcessingEnabled: (enabled: boolean) => void
    setVegetationDensity: (density: VegetationDensity) => void
    setDpr: (dpr: number) => void
    setAoQuality: (quality: AOQuality) => void
    setRenderGrassAndFlowers: (enabled: boolean) => void
    setTimeOfDayMode: (mode: TimeOfDayMode) => void
    setShadowQuality: (quality: ShadowQuality) => void
    setLoadDistance: (distance: number) => void
    setCameraDamping: (damping: number) => void
    autoDetectSettings: () => void
    applyPreset: (tier: 'high' | 'medium' | 'low') => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
    isHardwareDetected: false,
    activePreset: 'custom',
    postProcessingEnabled: true,
    vegetationDensity: 'low',
    dpr: 1.5,
    aoQuality: 'performance',
    renderGrassAndFlowers: false,
    timeOfDayMode: 'system',
    shadowQuality: 'low',
    loadDistance: 10,
    cameraDamping: 0.15,

    setPostProcessingEnabled: (enabled) => set({ postProcessingEnabled: enabled, activePreset: 'custom' }),
    setVegetationDensity: (density) => set({ vegetationDensity: density, activePreset: 'custom' }),
    setDpr: (dpr) => set({ dpr, activePreset: 'custom' }),
    setAoQuality: (quality) => set({ aoQuality: quality, activePreset: 'custom' }),
    setRenderGrassAndFlowers: (enabled) => set({ renderGrassAndFlowers: enabled, activePreset: 'custom' }),
    setTimeOfDayMode: (mode) => set({ timeOfDayMode: mode, activePreset: 'custom' }),
    setShadowQuality: (quality) => set({ shadowQuality: quality, activePreset: 'custom' }),
    setLoadDistance: (distance) => set({ loadDistance: distance, activePreset: 'custom' }),
    setCameraDamping: (damping) => set({ cameraDamping: damping, activePreset: 'custom' }),
    autoDetectSettings: () => {
        const tier = getPerformanceTier()
        const settings = presets[tier]
        set({ ...settings, isHardwareDetected: true, activePreset: tier })
    },
    applyPreset: (tier) => {
        const settings = presets[tier]
        set({ ...settings, activePreset: tier })
    },
}))
