import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'

export function StoneGableHouse({ position }: { position: THREE.Vector3Tuple }) {
    const { scene, materials } = useGLTF('/models/stone-gable-house.glb')
    const { isNight } = useTimeOfDay()

    useEffect(() => {
        if (!scene || !materials) return

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshStandardMaterial

                const isGlass = (material.map?.name.includes('glass'))
                
                if (isGlass) {
                    material.emissiveIntensity = isNight ? 3.0 : 0
                    material.toneMapped = false
                    material.emissive.setHex(0xffaa00)
                    material.transparent = true
                    material.opacity = 1.0
                    material.needsUpdate = true
                }
            }
        })
    }, [scene, materials, isNight])

    return <primitive object={scene.clone()} position={position} />
}

useGLTF.preload('/models/stone-gable-house.glb')
