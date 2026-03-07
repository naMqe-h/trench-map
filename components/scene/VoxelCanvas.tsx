"use client"

import { Canvas } from '@react-three/fiber'
import { Village } from '@/lib/types'
import { VoxelWorld } from './map/VoxelWorld'
import { useState } from 'react'
import LoadingScreen from '../ui/LoadingScreen'
import { BottomBar } from '../ui/BottomBar'

type VoxelCanvasProps = {
    villages: Village[]
}

export const VoxelCanvas = ({ villages }: VoxelCanvasProps) => {
    const [isReady, setIsReady] = useState(false)
    const [villageCount, setVillageCount] = useState(0)

    return (
        <>
            {!isReady && <LoadingScreen />}
            <Canvas
                dpr={[1, 1.5]}
                gl={{ antialias: false, logarithmicDepthBuffer: true }}
                style={{ height: '100vh', width: '100vw' }}
            >
                <ambientLight intensity={0.5} />
                <VoxelWorld 
                    villages={villages} 
                    onReady={() => setIsReady(true)} 
                    onCountChange={setVillageCount}
                />
            </Canvas>
            <BottomBar villageCount={villageCount} />
        </>
    )
}