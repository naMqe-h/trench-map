"use client"

import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { VoxelWorld } from './map/VoxelWorld'
import { Village } from '@/lib/types'
import { BottomBar } from '../ui/BottomBar'
import { TopBar } from '../ui/TopBar'
import { CameraControls } from '@react-three/drei'
import LoadingScreen from '../ui/LoadingScreen'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { EffectComposer, N8AO } from '@react-three/postprocessing'

type VoxelCanvasProps = {
    villages: Village[]
}

export const VoxelCanvas = ({ villages }: VoxelCanvasProps) => {
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

    return (
        <>
            <TopBar onTokenProcessed={handleTokenProcessed} generationStep={generationStep} />
            {!isReady && <LoadingScreen />}
            <Canvas
                dpr={[1, 1.5]}
                gl={{ antialias: false, logarithmicDepthBuffer: true }}
                style={{ height: '100vh', width: '100vw' }}
            >
                <color attach="background" args={[timeOfDay.backgroundColor]} />
                <EffectComposer multisampling={0}>
                    <N8AO
                        halfRes
                        aoRadius={20}
                        intensity={2}
                        aoSamples={5}
                    />
                    <VoxelWorld
                        villages={villages}
                        onReady={() => setIsReady(true)}
                        onCountChange={setVillageCount}
                        controlsRef={cameraControlsRef}
                        newVillage={newVillageData}
                        setGenerationStep={setGenerationStep}
                        onFlyToStart={() => setGenerationStep(null)}
                    />
                </EffectComposer>
            </Canvas>
            <BottomBar villageCount={villageCount} />
        </>
    )
}