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
import { useMapStore } from '@/store/useMapStore'
import { motion } from 'framer-motion'

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

    const isIntroPlaying = useMapStore(useShallow((state) => state.isIntroPlaying))

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
            <SettingsOverlay />

            <motion.div
                initial={{ opacity: 0, x: -20, y: -20 }}
                animate={{
                    opacity: isIntroPlaying ? 0 : 1,
                    x: isIntroPlaying ? -20 : 0,
                    y: isIntroPlaying ? -20 : 0,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ pointerEvents: isIntroPlaying ? 'none' : 'auto' }}
            >
                <PerformanceOverlay />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isIntroPlaying ? 0 : 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ pointerEvents: isIntroPlaying ? 'none' : 'auto' }}
            >
                <Sidebar />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: isIntroPlaying ? 0 : 1,
                    scale: isIntroPlaying ? 0.8 : 1,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ pointerEvents: isIntroPlaying ? 'none' : 'auto' }}
            >
                <Minimap />
            </motion.div>
        </>
    )
}
