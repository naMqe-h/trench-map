import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const DynamicSunLight = () => {
    const lightRef = useRef<THREE.DirectionalLight>(null!)
    const targetRef = useRef<THREE.Object3D>(new THREE.Object3D())

    useFrame((state) => {
        if (lightRef.current) {
            const controls = state.controls as any 
            const focusPoint = controls?.target || new THREE.Vector3(0, 0, 0)
            
            lightRef.current.position.set(
                focusPoint.x + 30,
                focusPoint.y + 60,
                focusPoint.z + 30
            )
            
            targetRef.current.position.copy(focusPoint)
            lightRef.current.target = targetRef.current
        }
    })

    return (
        <>
            <primitive object={targetRef.current} />
            <directionalLight
                ref={lightRef}
                castShadow
                intensity={1.5}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={200}
                shadow-camera-left={-80}
                shadow-camera-right={80}
                shadow-camera-top={80}
                shadow-camera-bottom={-80}
                shadow-bias={-0.0005}
            />
        </>
    )
}