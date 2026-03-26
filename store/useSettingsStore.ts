import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPerformanceTier } from '../lib/hardwareDetection'

export type VegetationDensity = 'high' | 'medium' | 'low'
export type AOQuality = 'quality' | 'performance' | 'off'
export type TimeOfDayMode = 'system' | 'day' | 'night'
export type ShadowQuality = 'on' | 'off'

type PresetSettings = Pick<
    SettingsState,
    'postProcessingEnabled' | 'dpr' | 'aoQuality' | 'shadowQuality' | 'loadDistance' | 'renderGrassAndFlowers'
>

const presets: Record<'high' | 'medium' | 'low', PresetSettings> = {
    high: {
        postProcessingEnabled: true,
        dpr: 1.5,
        aoQuality: 'quality',
        shadowQuality: 'on',
        loadDistance: 20,
        renderGrassAndFlowers: true,
    },
    medium: {
        postProcessingEnabled: true,
        dpr: 1.0,
        aoQuality: 'performance',
        shadowQuality: 'on',
        loadDistance: 12,
        renderGrassAndFlowers: false,
    },
    low: {
        postProcessingEnabled: false,
        dpr: 1.0,
        aoQuality: 'off',
        shadowQuality: 'off',
        loadDistance: 8,
        renderGrassAndFlowers: false,
    },
}

type Preset = 'high' | 'medium' | 'low' | 'custom'

interface SettingsState {
    _hasHydrated: boolean
    hasRunDetection: boolean
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

    setHasHydrated: (hydrated: boolean) => void
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

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            _hasHydrated: false,
            hasRunDetection: false,
            isHardwareDetected: false,
            activePreset: 'custom',
            postProcessingEnabled: true,
            vegetationDensity: 'low',
            dpr: 1.5,
            aoQuality: 'performance',
            renderGrassAndFlowers: false,
            timeOfDayMode: 'system',
            shadowQuality: 'on',
            loadDistance: 10,
            cameraDamping: 0.15,

            setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
            setPostProcessingEnabled: (enabled) => set({ postProcessingEnabled: enabled, activePreset: 'custom' }),
            setVegetationDensity: (density) => set({ vegetationDensity: density, activePreset: 'custom' }),
            setDpr: (dpr) => set({ dpr, activePreset: 'custom' }),
            setAoQuality: (quality) => set({ aoQuality: quality, activePreset: 'custom' }),
            setRenderGrassAndFlowers: (enabled) =>
                set({ renderGrassAndFlowers: enabled, activePreset: 'custom' }),
            setTimeOfDayMode: (mode) => set({ timeOfDayMode: mode, activePreset: 'custom' }),
            setShadowQuality: (quality) => set({ shadowQuality: quality, activePreset: 'custom' }),
            setLoadDistance: (distance) => set({ loadDistance: distance, activePreset: 'custom' }),
            setCameraDamping: (damping) => set({ cameraDamping: damping, activePreset: 'custom' }),
            autoDetectSettings: () => {
                if (get().hasRunDetection) {
                    set({ isHardwareDetected: true })
                    return
                }
                const tier = getPerformanceTier()
                const settings = presets[tier]
                set({ ...settings, isHardwareDetected: true, hasRunDetection: true, activePreset: tier })
            },
            applyPreset: (tier) => {
                const settings = presets[tier]
                set({ ...settings, activePreset: tier })
            },
        }),
        {
            name: 'trenchmap-settings-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true)
                }
            },
            partialize: (state) => {
                const { isHardwareDetected, _hasHydrated, ...rest } = state
                return rest
            },
        },
    ),
)
