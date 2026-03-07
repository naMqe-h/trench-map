"use client"

import { Canvas } from '@react-three/fiber'
import { Village } from '@/lib/types'
import { VoxelWorld } from './map/VoxelWorld'

type VoxelCanvasProps = {
    villages: Village[]
}

export const VoxelCanvas = ({ villages }: VoxelCanvasProps) => {
    return (
        <Canvas shadows style={{ height: '100vh', width: '100vw' }}>
            <ambientLight intensity={0.5} />
            <VoxelWorld villages={villages} />
        </Canvas>
    )
}