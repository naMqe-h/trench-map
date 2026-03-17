import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { useSettingsStore } from '@/lib/store/useSettingsStore'

type DynamicSunLightProps = {
    color?: string
    intensity?: number
}

export const DynamicSunLight = ({ color = "#FFFAE8", intensity = MAP_SETTINGS.SUN_LIGHT_INTENSITY }: DynamicSunLightProps) => {
    const lightRef = useRef<THREE.DirectionalLight>(null!)
    const targetRef = useRef<THREE.Object3D>(new THREE.Object3D())
    const targetVector = useRef(new THREE.Vector3())
    const shadowQuality = useSettingsStore(state => state.shadowQuality)

    const shadowMapSize = shadowQuality === 'high' ? 2048 : shadowQuality === 'medium' ? 1024 : 512

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
            color={color}
            intensity={intensity}
            castShadow={shadowQuality !== 'off'}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-camera-near={1}
            shadow-camera-far={200}
            shadow-bias={-0.0001}
        />
    )
}
