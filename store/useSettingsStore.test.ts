import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './useSettingsStore'

describe('useSettingsStore', () => {
    beforeEach(() => {
        useSettingsStore.setState({
            activePreset: 'custom',
            shadowQuality: 'on',
            aoQuality: 'performance',
            postProcessingEnabled: true,
            dpr: 1.5,
            loadDistance: 10,
            renderGrassAndFlowers: false,
        })
    })

    it('should have correct initial values', () => {
        const state = useSettingsStore.getState()
        expect(state.shadowQuality).toBe('on')
        expect(state.renderGrassAndFlowers).toBe(false)
    })

    it('should toggle shadowQuality strictly between on and off', () => {
        const { setShadowQuality } = useSettingsStore.getState()
        
        setShadowQuality('off')
        expect(useSettingsStore.getState().shadowQuality).toBe('off')
        
        setShadowQuality('on')
        expect(useSettingsStore.getState().shadowQuality).toBe('on')
    })

    it('should update activePreset to custom when manual change is made', () => {
        const { setDpr, applyPreset } = useSettingsStore.getState()
        
        applyPreset('high')
        expect(useSettingsStore.getState().activePreset).toBe('high')
        
        setDpr(1.0)
        expect(useSettingsStore.getState().activePreset).toBe('custom')
    })

    it('should apply high performance preset correctly', () => {
        const { applyPreset } = useSettingsStore.getState()
        
        applyPreset('high')
        
        const state = useSettingsStore.getState()
        expect(state.activePreset).toBe('high')
        expect(state.shadowQuality).toBe('on')
        expect(state.aoQuality).toBe('quality')
        expect(state.renderGrassAndFlowers).toBe(true)
    })

    it('should apply low performance preset correctly', () => {
        const { applyPreset } = useSettingsStore.getState()
        
        applyPreset('low')
        
        const state = useSettingsStore.getState()
        expect(state.activePreset).toBe('low')
        expect(state.shadowQuality).toBe('off')
        expect(state.aoQuality).toBe('off')
        expect(state.renderGrassAndFlowers).toBe(false)
    })
})
