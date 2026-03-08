import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'

export const DynamicSunLight = () => {
    const lightRef = useRef<THREE.DirectionalLight>(null!)
    const targetRef = useRef<THREE.Object3D>(new THREE.Object3D())
    const targetVector = useRef(new THREE.Vector3())

    useFrame((state) => {
        if (lightRef.current) {
            const controls = state.controls as any
            
            if (controls && typeof controls.getTarget === 'function') {
                controls.getTarget(targetVector.current)
            }
            
            lightRef.current.position.set(
                targetVector.current.x + 30,
                targetVector.current.y + 60,
                targetVector.current.z + 30
            )
            
            targetRef.current.position.copy(targetVector.current)
            lightRef.current.target = targetRef.current
        }
    })

    return (
        <directionalLight
            ref={lightRef}
            intensity={MAP_SETTINGS.SUN_LIGHT_INTENSITY}
        />
    )
}