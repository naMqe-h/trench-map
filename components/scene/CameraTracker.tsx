'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMapStore } from '@/store/useMapStore'
import { Vector3 } from 'three'
import { useRef } from 'react'

const direction = new Vector3()

export function CameraTracker() {
    const { camera } = useThree()
    const setCameraState = useMapStore((state) => state.setCameraState)

    const lastState = useRef({
        x: 0,
        z: 0,
        rot: 0,
    })

    useFrame(() => {
        const { x, z } = camera.position

        camera.getWorldDirection(direction)

        const rotationY = Math.atan2(direction.x, -direction.z)

        const posChanged =
            Math.abs(x - lastState.current.x) > 0.1 ||
            Math.abs(z - lastState.current.z) > 0.1
        const rotChanged = Math.abs(rotationY - lastState.current.rot) > 0.01

        if (posChanged || rotChanged) {
            setCameraState({ x, z }, rotationY)
            lastState.current = { x, z, rot: rotationY }
        }
    })

    return null
}
