"use client"

import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { VoxelWorld } from './map/VoxelWorld'
import { BottomBar } from '../ui/BottomBar'
import { TopBar } from '../ui/TopBar'
import { CameraControls } from '@react-three/drei'
import LoadingScreen from '../ui/LoadingScreen'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Village } from '@/types/token'
import { useShallow } from 'zustand/react/shallow'

type VoxelCanvasProps = {
    villages: Village[]
}

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
    const [generationStep, setGenerationStep] = useState<string | null>(null)
    const timeOfDay = useTimeOfDay()

    const handleTokenProcessed = (village: Village, index: number, isNew: boolean = true) => {
        setGenerationStep('fetching')
        setNewVillageData({ village, trigger: Date.now(), isNew })
    }

    const coordsRef = useRef<HTMLSpanElement>(null)

    return (
        <>
            <TopBar onTokenProcessed={handleTokenProcessed} generationStep={generationStep} />
            {!isReady && <LoadingScreen />}
            <Canvas
                shadows
                dpr={[1, dpr]}
                gl={{ antialias: false, logarithmicDepthBuffer: true }}
                style={{ height: '100vh', width: '100vw' }}
            >
                <color attach="background" args={[timeOfDay.backgroundColor]} />
                <VoxelWorld
                    villages={villages}
                    onReady={() => setIsReady(true)}
                    onCountChange={setVillageCount}
                    controlsRef={cameraControlsRef}
                    newVillage={newVillageData}
                    setGenerationStep={setGenerationStep}
                    onFlyToStart={() => setGenerationStep(null)}
                    coordsRef={coordsRef}
                />
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
                        ): <></>}
                    </EffectComposer>
                )}
            </Canvas>
            <BottomBar villageCount={villageCount} coordsRef={coordsRef} />
        </>
    )
}