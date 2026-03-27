"use client"

import { useState, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { VoxelWorld } from './map/VoxelWorld'
import { BottomBar } from '../ui/BottomBar'
import { TopBar } from '../ui/TopBar'
import { CameraControls } from '@react-three/drei'
import LoadingScreen from '../ui/LoadingScreen'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useMapStore } from '@/store/useMapStore'
import { Village } from '@/types/token'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence } from 'framer-motion'
import { CameraTracker } from './CameraTracker'

type VoxelCanvasProps = {
    villages: Village[]
}

const CANVAS_GL = { antialias: false, logarithmicDepthBuffer: true }
const CANVAS_STYLE = { height: '100vh', width: '100vw' }

export const VoxelCanvas = ({ villages }: VoxelCanvasProps) => {
    const { dpr, postProcessingEnabled, aoQuality } = useSettingsStore(
        useShallow((state) => ({
            dpr: state.dpr,
            postProcessingEnabled: state.postProcessingEnabled,
            aoQuality: state.aoQuality,
        }))
    )

    const [isReady, setIsReady] = useState(false)
    const [villageCount, setVillageCount] = useState(0)
    const cameraControlsRef = useRef<CameraControls>(null)
    const [newVillageData, setNewVillageData] = useState<{ village: Village, trigger: number, isNew: boolean } | null>(null)
    
    const { generationStep, setGenerationStepAction } = useMapStore(
        useShallow((state) => ({
            generationStep: state.generationStep,
            setGenerationStepAction: state.setGenerationStep,
        }))
    )

    const timeOfDay = useTimeOfDay()

    const canvasDpr = useMemo(() => [1, dpr] as [number, number], [dpr])

    const handleTokenProcessed = (village: Village, index: number, isNew: boolean = true) => {
        setGenerationStepAction('fetching')
        setNewVillageData({ village, trigger: Date.now(), isNew })
    }

    const coordsRef = useRef<HTMLSpanElement>(null)

    const handleReady = useCallback(() => setIsReady(true), [setIsReady])
    const handleFlyToStart = useCallback(() => setGenerationStepAction(null), [setGenerationStepAction])

    return (
        <>
            <TopBar onTokenProcessed={handleTokenProcessed} generationStep={generationStep} />
            <AnimatePresence>
                {!isReady && <LoadingScreen />}
            </AnimatePresence>
            <Canvas
                shadows
                dpr={canvasDpr}
                gl={CANVAS_GL}
                style={CANVAS_STYLE}
            >
                <color attach="background" args={[timeOfDay.backgroundColor]} />
                <VoxelWorld
                    villages={villages}
                    onReady={handleReady}
                    onCountChange={setVillageCount}
                    controlsRef={cameraControlsRef}
                    newVillage={newVillageData}
                    onFlyToStart={handleFlyToStart}
                    coordsRef={coordsRef}
                />
                <CameraTracker />
                {postProcessingEnabled && (
                    <EffectComposer multisampling={0} enableNormalPass={true}>
                        <Bloom
                            luminanceThreshold={1.2}
                            mipmapBlur={true}
                            intensity={1.5}
                            width={256}
                            height={256}
                        />
                        {aoQuality === 'quality' ? (
                            <N8AO halfRes={false} aoRadius={20} intensity={2} aoSamples={5} denoiseSamples={2} />
                        ) : <></>}
                        {aoQuality === 'performance' ? (
                            <N8AO halfRes={true} aoRadius={10} intensity={3} aoSamples={3} denoiseSamples={2} />
                        ) : <></>}
                    </EffectComposer>
                )}
            </Canvas>
            <BottomBar villageCount={villageCount} coordsRef={coordsRef} />
        </>
    )
}