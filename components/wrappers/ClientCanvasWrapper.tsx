'use client'

import { useSettingsStore } from '@/store/useSettingsStore'
import { useEffect } from 'react'
import { VoxelCanvas } from '@/components/scene/VoxelCanvas'
import { Tooltip } from '@/components/ui/Tooltip'
import { Sidebar } from '@/components/ui/Sidebar'
import { SettingsOverlay } from '@/components/ui/SettingsOverlay'
import { Village } from '@/types/token'
import LoadingScreen from '@/components/ui/LoadingScreen'

interface ClientCanvasWrapperProps {
    villages: Village[]
}

export function ClientCanvasWrapper({ villages }: ClientCanvasWrapperProps) {
    const { _hasHydrated, hasRunDetection, isHardwareDetected, autoDetectSettings } = useSettingsStore()

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
            <Tooltip />
            <Sidebar />
            <SettingsOverlay />
        </>
    )
}
