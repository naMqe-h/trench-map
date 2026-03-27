'use client'

import { useSettingsStore } from '@/store/useSettingsStore'
import { useEffect } from 'react'
import { PerformanceOverlay } from '@/components/ui/PerformanceOverlay'
import { VoxelCanvas } from '@/components/scene/VoxelCanvas'
import { Tooltip } from '@/components/ui/Tooltip'
import { Sidebar } from '@/components/ui/Sidebar'
import { SettingsOverlay } from '@/components/ui/SettingsOverlay'
import { Village } from '@/types/token'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useShallow } from 'zustand/react/shallow'
import { Minimap } from '../ui/Minimap'

interface ClientCanvasWrapperProps {
    villages: Village[]
}

export function ClientCanvasWrapper({ villages }: ClientCanvasWrapperProps) {
    const { _hasHydrated, hasRunDetection, isHardwareDetected, autoDetectSettings } = useSettingsStore(
        useShallow((state) => ({
            _hasHydrated: state._hasHydrated,
            hasRunDetection: state.hasRunDetection,
            isHardwareDetected: state.isHardwareDetected,
            autoDetectSettings: state.autoDetectSettings,
        }))
    )

    useEffect(() => {
        if (_hasHydrated) {
            if (hasRunDetection) {
                useSettingsStore.setState({ isHardwareDetected: true })
            } else {
                autoDetectSettings()
            }
        }
    }, [_hasHydrated, hasRunDetection, autoDetectSettings])

    if (!_hasHydrated || !isHardwareDetected) {
        return <LoadingScreen />
    }

    return (
        <>
            <VoxelCanvas villages={villages} />
            <PerformanceOverlay />
            <Tooltip />
            <Sidebar />
            <SettingsOverlay />
            <Minimap />
        </>
    )
}
