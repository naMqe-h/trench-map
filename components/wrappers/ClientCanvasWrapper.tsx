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
    const isHardwareDetected = useSettingsStore((state) => state.isHardwareDetected)
    const autoDetectSettings = useSettingsStore((state) => state.autoDetectSettings)

    useEffect(() => {
        if (!isHardwareDetected) {
            autoDetectSettings()
        }
    }, [autoDetectSettings, isHardwareDetected])

    if (!isHardwareDetected) {
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
